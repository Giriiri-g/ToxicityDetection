namespace API.DTOs;

public class CreatePostDto
{
    public string? Title { get; set; }
    public required string Message { get; set; }
    public string? MediaUrl { get; set; }   // base64 data URL from frontend
    public string? LinkUrl { get; set; }
}
