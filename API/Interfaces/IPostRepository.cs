using API.Entities;
using API.DTOs;

namespace API.Interfaces;

public interface IPostRepository
{
    Task Add(Post post);
    Task<List<Post>> GetFeed(int page, int pageSize, Guid? userId = null, string? thread = null);
    Task<Like?> GetLike(Guid PID, Guid UID);
    Task<List<bool>> DidUserLikePosts(Guid userId, List<Guid> PIDs);
    Task<List<Post>?> GetLikedPostsByUserId(Guid userId);
    Task<List<Post>?> GetPostsByUserId(Guid userId);
    Task AddLike(Like like);
    Task RemoveLike(Like like);
    Task ModifyLikeCount(Guid PID, int delta);
    Task ModifyCommentCount(Guid PID, int delta);

    // Moderation
    Task<bool> SetBlocked(Guid postId, bool isBlocked);
    Task<bool> SetBlurred(Guid postId, bool isBlurred);

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
