using API.DTOs;
using API.Entities;
using API.Interfaces;

namespace API.Services;

public class PostService : IPostService
{
    private readonly IPostRepository _posts;
    private readonly IToxicityService _toxicity;

    public PostService(IPostRepository posts, IToxicityService toxicity)
    {
        _posts = posts;
        _toxicity = toxicity;
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

        return ToDto(post);
    }

    public async Task<List<PostResponseDto>> GetFeed(int page, int pageSize)
    {
        var posts = await _posts.GetFeed(page, pageSize);
        return posts.Select(ToDto).ToList();
    }

    private static PostResponseDto ToDto(Post p) => new()
    {
        PID = p.PID,
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
            .Where(t => t.Score >= 0.35)
            .Select(t => new TagScoreDto { Tag = t.Tag })
            .ToList()
    };
}
