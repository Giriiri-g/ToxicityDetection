using API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[ApiController]
[Route("api/posts")]
public class PostController : ControllerBase
{
    private readonly AppDbContext _context;

    // NOTE: This controller depends on Post entities not present in current AppDbContext.
    // Keeping it excluded from compilation until feed CRUD is wired end-to-end.


    public PostController(AppDbContext context)
    {
        _context = context;
    }

    // GET api/posts/feed?k=1
    [HttpGet("feed")]
    public IActionResult GetFeed([FromQuery] int k = 1)
    {
        // Feed CRUD is not wired yet because AppDbContext currently does not include Post entities.
        // Returning 501 keeps the API compiling while auth + navigation pipeline is implemented.
        return StatusCode(501, "Feed not implemented yet.");
    }
}