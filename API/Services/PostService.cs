using API.DTOs;
using API.Entities;
using API.Interfaces;

namespace API.Services;

public class PostService : IPostService
{
    private readonly IPostRepository _posts;
    private readonly IToxicityService _toxicity;
    private readonly IAdminService _admin;

    public PostService(IPostRepository posts, IToxicityService toxicity, IAdminService admin)
    {
        _posts = posts;
        _toxicity = toxicity;
        _admin = admin;
    }

    public async Task<PostResponseDto> CreatePost(string username, CreatePostDto dto)
    {
        var (totalScore, tagScores) = await _toxicity.Analyze(dto.Message);

        var post = new Post
        {
            PID = Guid.NewGuid(),
            UserName = username,
            Title = dto.Title,
            Message = dto.Message,
            MediaUrl = dto.MediaUrl,
            LinkUrl = dto.LinkUrl,
            CreatedAt = DateTime.UtcNow,
            TotalToxicityScore = totalScore,
            Thread = dto.Thread,
            PPID = dto.PPID
        };

        // Link tag scores to the post
        foreach (var tag in tagScores)
        {
            tag.PostId = post.PID;
            tag.Post = post;
            post.TagScores.Add(tag);
        }

        await _posts.Add(post);
        await _posts.SaveChanges();

        var thresholds = await _admin.GetThresholds();
        return ToDto(post, thresholds);
    }

    public async Task<List<PostResponseDto>> GetFeed(int page, int pageSize, string? thread = null)
    {
        var posts = await _posts.GetFeed(page, pageSize, thread);
        var thresholds = await _admin.GetThresholds();
        return posts.Select(p => ToDto(p, thresholds)).ToList();
    }

    public async Task<List<ThreadCountDto>> GetThreadCounts() { return await _posts.GetThreadCounts(); }

    public async Task<PostResponseDto?> GetPostById(Guid postId)
    {
        var post = await _posts.GetById(postId);
        if (post == null) return null;

        var thresholds = await _admin.GetThresholds();
        return ToDto(post, thresholds);
    }

    public async Task<List<PostResponseDto>> GetCommentsForPost(Guid postId)
    {
        var comments = await _posts.GetCommentsByPostId(postId);
        var thresholds = await _admin.GetThresholds();
        return comments.Select(c => ToDto(c, thresholds)).ToList();
    }

    private static PostResponseDto ToDto(Post p, ToxicityThresholdsDto thresholds) => new()
    {
        PID = p.PID,
        PPID = p.PPID,
        UserName = p.UserName,
        Title = p.Title,
        Message = p.Message,
        MediaUrl = p.MediaUrl,
        LinkUrl = p.LinkUrl,
        CreatedAt = p.CreatedAt,
        LikesCount = p.LikesCount,
        CommentsCount = p.CommentsCount,
        TotalToxicityScore = p.TotalToxicityScore,
        TagScores = p.TagScores
            .Where(t => t.Score >= thresholds.TagThresholds.GetValueOrDefault(t.Tag, thresholds.BlurThreshold))
            .Select(t => new TagDto { Tag = t.Tag })
            .ToList(),
        Thread = p.Thread
    };
}