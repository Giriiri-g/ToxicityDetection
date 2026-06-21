namespace API.DTOs;

public class CreatePostDto
{
    public string? Thread { get; set; }
    public string? Title { get; set; }
    public required string Message { get; set; }
    public string? MediaUrl { get; set; }
    public string? LinkUrl { get; set; }
    public Guid? PPID { get; set; }
}
