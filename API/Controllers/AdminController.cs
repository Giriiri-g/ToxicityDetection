using API.DTOs;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService) => _adminService = adminService;

    [HttpGet("user-stats")]
    public async Task<IActionResult> GetUserStats()
        => Ok(await _adminService.GetUserStats());

    [HttpGet("toxicity-stats")]
    public async Task<IActionResult> GetToxicityStats([FromQuery] int days = 30)
        => Ok(await _adminService.GetToxicityStats(days));

    [HttpGet("thresholds")]
    public async Task<IActionResult> GetThresholds() => Ok(await _adminService.GetThresholds());

    [HttpPost("thresholds")]
    public async Task<IActionResult> SetThresholds([FromBody] ToxicityThresholdsDto dto)
    {
        await _adminService.SetThresholds(dto);
        return Ok(new { message = "Thresholds updated" });
    }

    [HttpGet("threads")]
    public async Task<IActionResult> GetTrendingThreads([FromQuery] int top = 10, [FromQuery] int days = 14)
        => Ok(await _adminService.GetTrendingThreads(top, days));

    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromBody] RegisterDto dto)
    {
        var (success, message) = await _adminService.CreateUser(dto);
        return success ? Ok(new { message }) : BadRequest(new { message });
    }
}
