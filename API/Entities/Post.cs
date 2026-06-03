using API.Models;

namespace API.Entities;

public class Post
{
    public Guid PID { get; set; }
    public Guid? PPID { get; set; } // null = top-level post, set = comment

    public required string UserName { get; set; }
    public string? Title { get; set; }
    public required string Message { get; set; }
    public string? MediaUrl { get; set; }  // base64 data URL or null
    public string? LinkUrl { get; set; }

    public required DateTime CreatedAt { get; set; }

    public int LikesCount { get; set; }
    public int SharesCount { get; set; }
    public int CommentsCount { get; set; }
    public double TotalToxicityScore { get; set; }

    // Navigation
    public User User { get; set; } = null!;
    public ICollection<TagScore> TagScores { get; set; } = new List<TagScore>();
}
