using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using API.Data;
using API.Entities;
using API.Interfaces;
using API.DTOs;
using Microsoft.EntityFrameworkCore;

namespace API.Data.Repositories;

public class PostRepository : IPostRepository
{
    private readonly AppDbContext _context;
    public PostRepository(AppDbContext context) => _context = context;
    public async Task Add(Post post){await _context.Posts.AddAsync(post);}
    public async Task<List<Post>> GetFeed(int page, int pageSize, string? thread = null){
        var cfg = await _context.ToxicityConfigs.FirstOrDefaultAsync(c => c.Id == 1);
        var blockThreshold = cfg?.BlockThreshold ?? 70.0;

        var query = _context.Posts
            .Where(p => p.PPID == null && p.TotalToxicityScore < blockThreshold);

        if (!string.IsNullOrWhiteSpace(thread))
        {
            query = query.Where(p => p.Thread == thread);
        }

        return await query
            .Include(p => p.TagScores)
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<Like?> GetLike(Guid PID, Guid UID)
    {
        return await _context.Likes.FirstOrDefaultAsync(l => l.PID == PID && l.UID == UID);
    }

    public async Task AddLike(Like like)
    {
        await _context.Likes.AddAsync(like);
    }

    public async Task RemoveLike(Like like)
    {
        _context.Likes.Remove(like);
    }

    public async Task ModifyLikeCount(Guid PID, int delta)
    {
        var post = await _context.Posts.FindAsync(PID);
        if (post != null)
        {
            post.LikesCount += delta;
        }
    }

    public async Task ModifyCommentCount(Guid PID, int delta)
    {
        var post = await _context.Posts.FindAsync(PID);
        if (post != null)
        {
            post.CommentsCount += delta;
        }
    }
    
    public async Task<int> GetTotalPostCount(){return await _context.Posts.CountAsync(p => p.PPID == null);}

    public async Task<List<(string Tag, int Count)>> GetFlaggedCountByTag(){
        var thresholds = await LoadTagThresholds();

        // Fetch all tag scores for non-null posts (PPID == null) to avoid EF translation issues with dictionary lookup
        var tagScores = await _context.TagScores
            .Where(ts => ts.Post.PPID == null)
            .Select(ts => new { ts.Tag, ts.Score })
            .ToListAsync();

        var grouped = tagScores
            .GroupBy(x => x.Tag)
            .Select(g => new { Tag = g.Key, Count = g.Count(x => x.Score >= thresholds.GetValueOrDefault(g.Key, 35.0)) })
            .Where(x => x.Count > 0) // Only include tags with at least one flagged score
            .OrderByDescending(x => x.Count)
            .ToList();

        return grouped.Select(x => (x.Tag, x.Count)).ToList();
    }

    public async Task<List<(DateTime Date, int NewPosts, int FlaggedPosts)>> GetDailyTrend(int days){
        var since = DateTime.UtcNow.Date.AddDays(-(days - 1));
        var thresholds = await LoadTagThresholds();

        var posts = await _context.Posts
            .Where(p => p.PPID == null && p.CreatedAt >= since)
            .Include(p => p.TagScores)
            .ToListAsync();

        return Enumerable.Range(0, days)
            .Select(i =>
            {
                var day = since.AddDays(i);
                var dayPosts = posts.Where(p => p.CreatedAt.Date == day).ToList();
                var flaggedCount = dayPosts.Count(p => p.TagScores.Any(ts => ts.Score >= thresholds.GetValueOrDefault(ts.Tag, 35.0)));
                return (day, dayPosts.Count, flaggedCount);
            })
            .ToList();
    }

    public async Task<List<(string Thread, int Count)>> GetThreadRankings(){
        var grouped = await _context.Posts
            .Where(p => p.PPID == null && p.Thread != null)
            .GroupBy(p => p.Thread!)
            .Select(g => new { Thread = g.Key, Count = g.Count() })
            .OrderByDescending(x => x.Count)
            .Take(20)
            .ToListAsync();

        return grouped.Select(x => (x.Thread, x.Count)).ToList();
    }

    public async Task<List<Post>> GetFlaggedPosts(int page, int pageSize){
        var thresholds = await LoadTagThresholds();

        return await _context.Posts
            .Where(p => p.PPID == null)
            .Include(p => p.TagScores)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync()
            .ContinueWith(t => t.Result
                .Where(p => p.TagScores.Any(ts => ts.Score >= thresholds.GetValueOrDefault(ts.Tag, 35.0)))
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList());
    }

    public async Task<int> GetFlaggedPostsCount(){
        var thresholds = await LoadTagThresholds();
        return await _context.Posts
            .Include(p => p.TagScores)
            .Where(p => p.PPID == null)
            .ToListAsync()
            .ContinueWith(t => t.Result.Count(p => p.TagScores.Any(ts => ts.Score >= thresholds.GetValueOrDefault(ts.Tag, 35.0))));
    }

    public async Task<Post?> GetById(Guid id){
        return await _context.Posts
            .Include(p => p.TagScores)
            .FirstOrDefaultAsync(p => p.PID == id);
    }

    public async Task<List<Post>> GetByUsername(string username){
        return await _context.Posts
            .Where(p => p.UserName == username && p.PPID == null)
            .Include(p => p.TagScores)
            .OrderByDescending(p => p.CreatedAt)
            .Take(20)
            .ToListAsync();
    }

    public async Task UpdateTagScores(Post post, double totalScore, List<TagScore> tags){
        post.TotalToxicityScore = totalScore;

        _context.TagScores.RemoveRange(_context.TagScores.Where(t => t.PostId == post.PID));
        await SaveChanges();

        foreach (var tag in tags)
        {
            tag.Id = Guid.NewGuid();
            tag.PostId = post.PID;
            tag.Post = post;
        }

        await _context.TagScores.AddRangeAsync(tags);
        await SaveChanges();
    }

    public async Task<List<Post>> GetCommentsByPostId(Guid postId){
        // Fetch all descendants (recursively) but return them flattened as a single list.
        // Frontend will build the thread tree for visualization.
        var allComments = new List<Post>();
        var currentLevel = await _context.Posts
            .Where(p => p.PPID == postId)
            .Include(p => p.User)
            .Include(p => p.TagScores)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        allComments.AddRange(currentLevel);

        while (currentLevel.Any())
        {
            var parentIds = currentLevel.Select(p => p.PID).ToList();

            var nextLevel = await _context.Posts
                .Where(p => p.PPID.HasValue && parentIds.Contains(p.PPID.Value))
                .Include(p => p.User)
                .Include(p => p.TagScores)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            allComments.AddRange(nextLevel);
            currentLevel = nextLevel;
        }

        return allComments;
    }


    public async Task SaveChanges(){ await _context.SaveChangesAsync(); }

    public async Task<List<ThreadCountDto>> GetThreadCounts(){
        var query = from p in _context.Posts
                    where p.PPID == null
                    group p by p.Thread into g
                    select new ThreadCountDto
                    {
                        Thread = g.Key ?? "No Thread",
                        Count = g.Count()
                    };

        return await query.ToListAsync();
    }

    public async Task<Post?> GetPostWithComments(Guid id){
        var post = await _context.Posts
            .Include(p => p.User)
            .Include(p => p.TagScores)
            .FirstOrDefaultAsync(p => p.PID == id);

        if (post == null)
            return null;

        var allComments = new List<Post>();
        var currentLevel = await _context.Posts
            .Where(p => p.PPID == id)
            .Include(p => p.User)
            .Include(p => p.TagScores)
            .ToListAsync();
        allComments.AddRange(currentLevel);

        while (currentLevel.Any())
        {
            var parentIds = currentLevel.Select(p => p.PID).ToList();
            var nextLevel = await _context.Posts
                .Where(p => p.PPID.HasValue && parentIds.Contains(p.PPID.Value))
                .Include(p => p.User)
                .Include(p => p.TagScores)
                .ToListAsync();
            allComments.AddRange(nextLevel);
            currentLevel = nextLevel;
        }

        // Build the tree: map parent PID to list of child posts
        var childrenByParentId = allComments
            .Where(c => c.PPID.HasValue)
            .GroupBy(c => c.PPID!.Value) // Use null-forgiving operator since we know it's not null
            .ToDictionary(g => g.Key, g => g.ToList());

        // Set ChildPosts for each comment
        foreach (var comment in allComments)
        {
            if (comment.PPID.HasValue && childrenByParentId.TryGetValue(comment.PPID.Value, out var children))
            {
                comment.ChildPosts = children;
            }
        }

        // Set the post's ChildPosts to the top-level comments (those with PPID == id)
        post.ChildPosts = allComments.Where(c => c.PPID == id).ToList();

        return post;
    }

    private async Task<Dictionary<string, double>> LoadTagThresholds(){
        var cfg = await _context.ToxicityConfigs.FirstOrDefaultAsync(c => c.Id == 1);
        if (cfg == null || string.IsNullOrWhiteSpace(cfg.TagThresholdsJson))
        {
            return new Dictionary<string, double>(StringComparer.OrdinalIgnoreCase);
        }

        try
        {
            return JsonSerializer.Deserialize<Dictionary<string, double>>(cfg.TagThresholdsJson, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            }) ?? new Dictionary<string, double>(StringComparer.OrdinalIgnoreCase);
        }
        catch
        {
            return new Dictionary<string, double>(StringComparer.OrdinalIgnoreCase);
        }
    }
}