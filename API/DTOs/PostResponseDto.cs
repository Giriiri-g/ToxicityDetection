namespace API.DTOs;

public class TagScoreDto
{
    public string Tag { get; set; } = "";
}

public class PostResponseDto
{
    public Guid PID { get; set; }
    public string UserName { get; set; } = "";
    public string? Title { get; set; }
    public string Message { get; set; } = "";
    public string? MediaUrl { get; set; }
    public string? LinkUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public int LikesCount { get; set; }
    public int CommentsCount { get; set; }
    public double TotalToxicityScore { get; set; }
    public List<TagScoreDto> TagScores { get; set; } = new();
}
