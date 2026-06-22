namespace API.DTOs;

public class TagScoreDto
{
    public string Tag { get; set; } = "";
    public double Score { get; set; }
}

public class ReviewPostDto
{
    public Guid PID { get; set; }
    public string UserName { get; set; } = "";
    public string? Title { get; set; }
    public string Message { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public double TotalToxicityScore { get; set; }
    public List<TagScoreDto> TagScores { get; set; } = new();
}

public class ReviewHistoryItemDto
{
    public Guid PID { get; set; }
    public string? Title { get; set; }
    public double TotalToxicityScore { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ReviewPostDetailDto : ReviewPostDto
{
    public string? MediaUrl { get; set; }
    public string? LinkUrl { get; set; }
    public DateOnly UserJoined { get; set; }
    public List<ReviewHistoryItemDto> History { get; set; } = new();
}

public class ReviewActionDto{
    public bool Approve { get; set; }
    public bool ClearScores { get; set; }
    public List<string>? EditedTags { get; set; }
    public string? Feedback { get; set; }
}

public class BanUserResponseDto{
    public int Duration { get; set; }
    public string Unit { get; set; } = "";
    public string? Reason { get; set; }
}

public class BanUserDto{
    public Guid UserId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string Reason { get; set; } = "";
    public Guid ModeratorId { get; set; }
}
