namespace API.Entities;

public class TagScore
{
    public Guid Id { get; set; }
    public Guid PostId { get; set; }
    public required string Tag { get; set; }
    public double Score { get; set; }

    // Navigation
    public Post Post { get; set; } = null!;
}
