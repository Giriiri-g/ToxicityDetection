namespace API.Entities;

public class AppUser
{
    public Guid Id { get; set; } // Seperate ID from UserName for the case of username changes in the future
    public required  string UserName { get; set; } = Guid.NewGuid().ToString();
    public required string Email { get; set; }
    public required string PhoneNumber { get; set; }
    public required string Description { get; set; }
    public required Boolean Gender { get; set; }
    public required DateOnly DateOfBirth { get; set; }
    public required DateOnly Created { get; set; }
    public ICollection<Post> Posts { get; set; } = new List<Post>();
    public required Auth Auth { get; set; }
}
