namespace API.DTOs;

public class RegisterDto
{
    public required string Username { get; set; }
    public required string Email { get; set; }
    public required string Password { get; set; }
    public required string Role { get; set; }

    // Optional profile fields (frontend may send empty string)
    public string? PhoneNumber { get; set; }
    public string? Gender { get; set; } // "Male" | "Female" | "Other" | null/empty
    public DateOnly? DateOfBirth { get; set; }
    public string? Description { get; set; }
}

