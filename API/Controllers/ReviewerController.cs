using API.DTOs;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers;

[ApiController]
[Route("api/reviewer")]
[Authorize(Roles = "Reviewer,Admin")]
public class ReviewerController : ControllerBase
{
    private readonly IReviewerService _reviewer;

    public ReviewerController(IReviewerService reviewer) => _reviewer = reviewer;

    // GET api/reviewer/posts?page=1&pageSize=10
    [HttpGet("posts")]
    public async Task<IActionResult> GetFlaggedPosts([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        if (page < 1 || pageSize < 1 || pageSize > 50)
            return BadRequest(new { message = "Invalid pagination parameters." });

        var (posts, total) = await _reviewer.GetFlaggedPosts(page, pageSize);
        return Ok(new { posts, total, page, pageSize });
    }

    // GET api/reviewer/posts/{id}
    [HttpGet("posts/{id:guid}")]
    public async Task<IActionResult> GetPostDetail(Guid id)
    {
        var detail = await _reviewer.GetPostDetail(id);
        return detail is null ? NotFound() : Ok(detail);
    }

    // POST api/reviewer/posts/{id}/review
    [HttpPost("posts/{id:guid}/review")]
    public async Task<IActionResult> ReviewPost(Guid id, [FromBody] ReviewActionDto dto)
    {
        var (success, message) = await _reviewer.ReviewPost(id, dto);
        return success ? Ok(new { message }) : NotFound(new { message });
    }

    // PATCH api/reviewer/posts/{id}/block
    [HttpPatch("posts/{id:guid}/block")]
    public async Task<IActionResult> BlockPost(Guid id, [FromBody] SetFlagDto dto)
    {
        var (success, message) = await _reviewer.SetPostBlocked(id, dto.Value);
        return success ? Ok(new { message }) : NotFound(new { message });
    }

    // PATCH api/reviewer/posts/{id}/blur
    [HttpPatch("posts/{id:guid}/blur")]
    public async Task<IActionResult> BlurPost(Guid id, [FromBody] SetFlagDto dto)
    {
        var (success, message) = await _reviewer.SetPostBlurred(id, dto.Value);
        return success ? Ok(new { message }) : NotFound(new { message });
    }

    // POST api/reviewer/ban/clearcache
    [HttpPost("ban/clearcache")]
    public async Task<IActionResult> ClearCache()
    {
        return Ok(await _reviewer.ClearCache());
    }

    // POST api/reviewer/ban/{id}
    [HttpPost("ban/{id:guid}")]
    public async Task<IActionResult> BanUser(Guid id, [FromBody] BanUserResponseDto dto)
    {
        var moderatorIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (moderatorIdClaim is null || !Guid.TryParse(moderatorIdClaim, out var moderatorId))
            return Unauthorized(new { message = "Moderator identity could not be resolved from token." });

        var (success, message) = await _reviewer.BanUser(id, dto, moderatorId);
        return success ? Ok(new { message }) : NotFound(new { message });
    }
}
