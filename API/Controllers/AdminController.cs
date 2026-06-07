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

    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromBody] RegisterDto dto)
    {
        var (success, message) = await _adminService.CreateUser(dto);
        return success ? Ok(new { message }) : BadRequest(new { message });
    }
}
