using System.ComponentModel.DataAnnotations.Schema;
using API.Models;

namespace API.Entities;

public class Post
{
    public Guid PID { get; set; }
    public Guid? PPID { get; set; } // null = top-level post, set = comment

    public required string UserName { get; set; }
    public string? Thread { get; set; }
    public string? Title { get; set; }
    public required string Message { get; set; }
    public string? MediaUrl { get; set; }  // base64 data URL or null
    public string? LinkUrl { get; set; }

    public required DateTime CreatedAt { get; set; }

    public int LikesCount { get; set; } = 0;
    public int SharesCount { get; set; } = 0;
    public int CommentsCount { get; set; } = 0;
    public double TotalToxicityScore { get; set; }

    public bool IsBlocked { get; set; } = false;
    public bool IsBlurred { get; set; } = false;

    [NotMapped]
    public bool IsLikedByCurrentUser { get; set; } = false;

    // Navigation
    public User User { get; set; } = null!;
    public ICollection<TagScore> TagScores { get; set; } = [];

    // Self-referencing navigation for comments
    public Post? ParentPost { get; set; }
    public ICollection<Post> ChildPosts { get; set; } = [];
}