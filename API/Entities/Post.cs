using System;

namespace API.Entities;

public class Post
{
    public Guid PID { get; set; } // Post ID

    public Guid? PPID { get; set; } // Parent post ID, for cascading comments, normal posts will have this as null
    public required string UserName { get; set; }

    public string? Title { get; set; } // For normal posts, this is the title. For comments, this can be null or empty.
    public required string Message { get; set; } // The content of the post or comment

    public required DateOnly CreatedAt { get; set; }

    public required int LikesCount { get; set; }
    public required int SharesCount { get; set; }
    public required int CommentsCount { get; set; }

    public required double TotalToxicityScore { get; set; }

    // Navigation
    public required AppUser User { get; set; }
    public ICollection<TagScore> TagScores { get; set; } = new List<TagScore>();
}