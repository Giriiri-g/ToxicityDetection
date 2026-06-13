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

/// <summary>Body sent by reviewer when approving or rejecting a post.</summary>
public class ReviewActionDto
{
    /// <summary>true = approve, false = reject</summary>
    public bool Approve { get; set; }

    /// <summary>When approving: true clears scores/tags, false keeps them (optionally with EditedTags).</summary>
    public bool ClearScores { get; set; }

    /// <summary>Reviewer-edited tag list. Null means keep existing.</summary>
    public List<string>? EditedTags { get; set; }

    public string? Feedback { get; set; }
}
