using API.Entities;

namespace API.Interfaces;

public interface IPostRepository
{
    Task Add(Post post);
    Task<List<Post>> GetFeed(int page, int pageSize);
    Task SaveChanges();
}
