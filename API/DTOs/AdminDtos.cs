namespace API.DTOs;

public record TagStatDto(string Tag, int FlaggedCount);
public record TrendPointDto(string Label, int NewPosts, int FlaggedPosts);

public class ToxicityStatsDto
{
    public int TotalPosts { get; set; }
    public int FlaggedPosts { get; set; }
    public List<TagStatDto> TagCounts { get; set; } = new();
    public List<TrendPointDto> Trend { get; set; } = new();
}

public class ToxicityThresholdsDto
{
    public Dictionary<string, double> TagThresholds { get; set; } = new();
    public double BlurThreshold { get; set; }
    public double BlockThreshold { get; set; }
}

public record ThreadRankDto(string Thread, int PostCount, List<TrendPointDto> Trend);
