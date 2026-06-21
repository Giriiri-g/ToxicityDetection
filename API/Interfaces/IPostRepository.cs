using API.Entities;
using API.DTOs;

namespace API.Interfaces;

public interface IPostRepository
{
    Task Add(Post post);
    Task<List<Post>> GetFeed(int page, int pageSize, string? thread = null);

    // Stats / admin
    Task<int> GetTotalPostCount();
    Task<List<(string Tag, int Count)>> GetFlaggedCountByTag();
    Task<List<(DateTime Date, int NewPosts, int FlaggedPosts)>> GetDailyTrend(int days);
    Task<List<(string Thread, int Count)>> GetThreadRankings();
    Task<List<ThreadCountDto>> GetThreadCounts();

    // Reviewer
    Task<List<Post>> GetFlaggedPosts(int page, int pageSize);
    Task<int> GetFlaggedPostsCount();
    Task<Post?> GetById(Guid id);
    Task<List<Post>> GetByUsername(string username);
    Task<List<Post>> GetCommentsByPostId(Guid postId);
    Task UpdateTagScores(Post post, double totalScore, List<TagScore> tags);

    Task SaveChanges();
}
