using API.DTOs;
using API.Entities;
using API.Interfaces;

namespace API.Services;

public class ReviewerService : IReviewerService
{
    private readonly IPostRepository _posts;
    private readonly IUserRepository _users;

    public ReviewerService(IPostRepository posts, IUserRepository users)
    {
        _posts = posts;
        _users = users;
    }

    public async Task<(List<ReviewPostDto> posts, int totalCount)> GetFlaggedPosts(int page, int pageSize)
    {
        var posts = await _posts.GetFlaggedPosts(page, pageSize);
        var total = await _posts.GetFlaggedPostsCount();
        return (posts.Select(ToDto).ToList(), total);
    }

    public async Task<ReviewPostDetailDto?> GetPostDetail(Guid id)
    {
        var post = await _posts.GetById(id);
        if (post is null) return null;

        var user = await _users.GetByUsername(post.UserName);
        var history = await _posts.GetByUsername(post.UserName);

        var detail = new ReviewPostDetailDto
        {
            PID = post.PID,
            UserName = post.UserName,
            Title = post.Title,
            Message = post.Message,
            MediaUrl = post.MediaUrl,
            LinkUrl = post.LinkUrl,
            CreatedAt = post.CreatedAt,
            TotalToxicityScore = post.TotalToxicityScore,
            TagScores = post.TagScores.Select(t => new TagScoreDto { Tag = t.Tag, Score = t.Score }).ToList(),
            UserJoined = user?.Created ?? DateOnly.MinValue,
            History = history
                .Where(h => h.PID != id)
                .OrderByDescending(h => h.CreatedAt)
                .Select(h => new ReviewHistoryItemDto
                {
                    PID = h.PID,
                    Title = h.Title,
                    TotalToxicityScore = h.TotalToxicityScore,
                    CreatedAt = h.CreatedAt
                })
                .ToList()
        };

        return detail;
    }

    public async Task<(bool success, string message)> ReviewPost(Guid id, ReviewActionDto dto)
    {
        var post = await _posts.GetById(id);
        if (post is null) return (false, "Post not found.");

        if (dto.Approve)
        {
            if (dto.ClearScores)
            {
                await _posts.UpdateTagScores(post, 0, []);
            }
            else if (dto.EditedTags is { Count: > 0 })
            {
                var newTags = dto.EditedTags.Select(tag => new TagScore
                {
                    Id = Guid.NewGuid(),
                    PostId = post.PID,
                    Tag = tag,
                    Score = post.TagScores.FirstOrDefault(t => t.Tag == tag)?.Score ?? 0
                }).ToList();

                var newTotal = newTags.Sum(t => t.Score);
                await _posts.UpdateTagScores(post, newTotal, newTags);
            }
        }
        else
        {
            // Reject: flag as removed by setting a sentinel toxicity value or simply remove
            await _posts.UpdateTagScores(post, 100, post.TagScores.ToList());
        }

        await _posts.SaveChanges();
        return (true, dto.Approve ? "Post approved." : "Post rejected.");
    }

    private static ReviewPostDto ToDto(Post p) => new()
    {
        PID = p.PID,
        UserName = p.UserName,
        Title = p.Title,
        Message = p.Message,
        CreatedAt = p.CreatedAt,
        TotalToxicityScore = p.TotalToxicityScore,
        TagScores = p.TagScores.Select(t => new TagScoreDto { Tag = t.Tag, Score = t.Score }).ToList()
    };
}
