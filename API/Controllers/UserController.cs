using API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[ApiController]
[Route("api/users")]
public class UserController : ControllerBase
{
    private readonly AppDbContext _context;

    public UserController(AppDbContext context)
    {
        _context = context;
    }

    // GET api/users/{username}
    [HttpGet("{username}")]
    public async Task<IActionResult> GetUser(string username)
    {
        var user = await _context.Users
            .Where(u => u.UserName == username)
            .Select(u => new
            {
                u.UserName,
                u.Email,
                u.PhoneNumber,
                u.Description,
                u.Gender,
                u.DateOfBirth,
                u.Created
            })
            .FirstOrDefaultAsync();

        if (user == null)
            return NotFound();

        return Ok(user);
    }
}