using API.Data;
using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data.Repositories;

public class PostRepository : IPostRepository
{
    private readonly AppDbContext _context;

    public PostRepository(AppDbContext context) => _context = context;

    public async Task Add(Post post) => await _context.Posts.AddAsync(post);

    public async Task<List<Post>> GetFeed(int page, int pageSize) =>
        await _context.Posts
            .Where(p => p.PPID == null)          // top-level posts only
            .Include(p => p.TagScores)
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

    public async Task SaveChanges() => await _context.SaveChangesAsync();
}
