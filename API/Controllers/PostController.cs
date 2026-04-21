using API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[ApiController]
[Route("api/posts")]
public class PostController : ControllerBase
{
    private readonly AppDbContext _context;

    public PostController(AppDbContext context)
    {
        _context = context;
    }

    // GET api/posts/feed?k=1
    [HttpGet("feed")]
    public async Task<IActionResult> GetFeed([FromQuery] int k = 1)
    {
        int pageSize = 10*k;
        // int skip = (k - 1) * pageSize;

        var posts = await _context.Posts
            .Where(p => p.PPID == null)
            .OrderByDescending(p => p.CreatedAt)
            // .Skip(skip)
            .Take(pageSize)
            .Select(p => new
            {
                pid = p.PID,
                userName = p.UserName,
                title = p.Title,
                message = p.Message,
                createdAt = p.CreatedAt,
                likesCount = p.LikesCount,
                sharesCount = p.SharesCount,
                commentsCount = p.CommentsCount,
                totalToxicityScore = p.TotalToxicityScore,

                tagScores = p.TagScores.Select(t => new
                {
                    tag = t.Tag,
                    score = t.Score
                }).ToList()
            })
            .ToListAsync();

        return Ok(posts);
    }
}