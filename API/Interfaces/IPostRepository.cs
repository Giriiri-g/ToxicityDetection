using API.Entities;

namespace API.Interfaces;

public interface IPostRepository
{
    Task Add(Post post);
    Task<List<Post>> GetFeed(int page, int pageSize);

    // Reviewer
    Task<List<Post>> GetFlaggedPosts(int page, int pageSize);
    Task<int> GetFlaggedPostsCount();
    Task<Post?> GetById(Guid id);
    Task<List<Post>> GetByUsername(string username);
    Task UpdateTagScores(Post post, double totalScore, List<TagScore> tags);

    Task SaveChanges();
}
