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
        var posts = await _postService.GetFeed(page, pageSize, thread);
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
}
