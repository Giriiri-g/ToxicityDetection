namespace API.DTOs;

public class TagDto
{
    public string Tag { get; set; } = "";
}

public class ThreadCountDto
{
    public string Thread { get; set; } = "";
    public int Count { get; set; }
}

public class PostResponseDto
{
    public Guid PID { get; set; }
    public Guid? PPID { get; set; }
    public string UserName { get; set; } = "";
    public string? Title { get; set; }
    public string Message { get; set; } = "";
    public string? MediaUrl { get; set; }
    public string? LinkUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public int LikesCount { get; set; }
    public int CommentsCount { get; set; }
    public double TotalToxicityScore { get; set; }
    public List<TagDto> TagScores { get; set; } = new();
    public string? Thread { get; set; }
    public bool IsBlurred { get; set; }
    public bool IsLikedByUser { get; set; }

    // For holding comments (child posts) when needed
    public List<PostResponseDto> Comments { get; set; } = [];
}