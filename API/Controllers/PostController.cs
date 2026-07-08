using System.Security.Claims;
using API.DTOs;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/posts")]
[Authorize]
public class PostController : ControllerBase
{
    private readonly IPostService _postService;

    public PostController(IPostService postService) => _postService = postService;

    // POST api/posts
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePostDto dto)
    {
        var username = User.FindFirstValue(ClaimTypes.Name);
        if (username == null) return Unauthorized();

        var result = await _postService.CreatePost(username, dto);
        return CreatedAtAction(nameof(GetFeed), result);
    }

    // GET api/posts/feed?page=1&pageSize=20&thread=...
    [HttpGet("feed")]
    public async Task<IActionResult> GetFeed([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? thread = null)
    {
        // Edge Case: UID missing in claims, set isliked... to false
        Guid? userId = null;
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdClaim != null && Guid.TryParse(userIdClaim, out var parsed))
            userId = parsed;

        var posts = await _postService.GetFeed(page, pageSize, userId, thread);
        return Ok(posts);
    }

    // GET api/posts/thread-counts
    [HttpGet("thread-counts")]
    public async Task<IActionResult> GetThreadCounts()
    {
        var threadCounts = await _postService.GetThreadCounts();
        return Ok(threadCounts);
    }

    // GET api/posts/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetPostById(Guid id)
    {
        var post = await _postService.GetPostById(id);
        if (post == null) return NotFound();
        return Ok(post);
    }

    // GET api/posts/{id}/comments
    [HttpGet("{id}/comments")]
    public async Task<IActionResult> GetCommentsForPost(Guid id)
    {
        var comments = await _postService.GetCommentsForPost(id);
        return Ok(comments);
    }

    // POST api/posts/{id}/like
    [HttpPost("{PID}/like")]
    public async Task<IActionResult> LikePost(Guid PID)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !Guid.TryParse(userIdClaim, out var UID))
            return Unauthorized(new { message = "User identity could not be resolved from token." });

        await _postService.LikePost(PID, UID);
        return Ok(new { message = "Reached Post Like Controller Successfully." });
    }

    // DELETE api/posts/{id}/like
    [HttpDelete("{PID}/like")]
    public async Task<IActionResult> UnLikePost(Guid PID)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !Guid.TryParse(userIdClaim, out var UID))
            return Unauthorized(new { message = "User identity could not be resolved from token." });

        await _postService.UnLikePost(PID, UID);
        return Ok(new { message = "Reached Post Unlike Controller Successfully." });
    }
}
