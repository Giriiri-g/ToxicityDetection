using API.DTOs;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/reviewer")]
[Authorize(Roles = "Reviewer,Admin")]
public class ReviewerController : ControllerBase
{
    private readonly IReviewerService _reviewer;

    public ReviewerController(IReviewerService reviewer) => _reviewer = reviewer;

    [HttpGet("posts")]
    public async Task<IActionResult> GetFlaggedPosts([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        if (page < 1 || pageSize < 1 || pageSize > 50)
            return BadRequest(new { message = "Invalid pagination parameters." });

        var (posts, total) = await _reviewer.GetFlaggedPosts(page, pageSize);
        return Ok(new { posts, total, page, pageSize });
    }

    [HttpGet("posts/{id:guid}")]
    public async Task<IActionResult> GetPostDetail(Guid id)
    {
        var detail = await _reviewer.GetPostDetail(id);
        return detail is null ? NotFound() : Ok(detail);
    }

    [HttpPost("posts/{id:guid}/review")]
    public async Task<IActionResult> ReviewPost(Guid id, [FromBody] ReviewActionDto dto)
    {
        var (success, message) = await _reviewer.ReviewPost(id, dto);
        return success ? Ok(new { message }) : NotFound(new { message });
    }
}
