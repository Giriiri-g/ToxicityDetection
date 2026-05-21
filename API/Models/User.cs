namespace API.Models;

public class User
{
    public Guid Id { get; set; } // Seperate ID from UserName for the case of username changes in the future
    public required  string UserName { get; set; }
    public required string Email { get; set; }
    public required string PhoneNumber { get; set; }
    public required string Description { get; set; }
    public required Boolean Gender { get; set; }
    public required DateOnly DateOfBirth { get; set; }
    public required DateOnly Created { get; set; }
    public required string PasswordHash { get; set; }
    public required string Role { get; set; }
}