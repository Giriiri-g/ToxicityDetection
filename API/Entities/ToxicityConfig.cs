namespace API.Entities;

/// <summary>
/// Singleton-style config row (always Id = 1).
/// Per-tag thresholds stored as JSON; overall blur/block as doubles.
/// </summary>
public class ToxicityConfig
{
    public int Id { get; set; } = 1;

    /// <summary>JSON: { "Hate": 0.35, "Spam": 0.50, ... }</summary>
    public string TagThresholdsJson { get; set; } = "{}";

    /// <summary>Overall score above which a post is blurred (0–100).</summary>
    public double BlurThreshold { get; set; } = 35.0;

    /// <summary>Overall score above which a post is blocked from feed (0–100).</summary>
    public double BlockThreshold { get; set; } = 70.0;
}
