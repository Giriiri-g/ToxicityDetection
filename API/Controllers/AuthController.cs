using API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuthController(AppDbContext context)
    {
        _context = context;
    }

    // GET api/auth/{username}
    [HttpGet("{username}")]
    public async Task<IActionResult> GetAuth(string username)
    {
        var auth = await _context.Auths
            .Where(a => a.UserName == username)
            .Select(a => new
            {
                a.PasswordHash
            })
            .FirstOrDefaultAsync();

        if (auth == null)
            return Ok(null);

        return Ok(auth);
    }
}