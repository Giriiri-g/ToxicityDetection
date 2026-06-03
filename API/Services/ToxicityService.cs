using API.Entities;
using API.Interfaces;

namespace API.Services;

/// <summary>
/// Stub implementation — returns random scores.
/// Replace Analyze() body with real ML API call when ready.
/// </summary>
public class ToxicityService : IToxicityService
{
    private static readonly string[] Tags = ["Hate", "Threat", "NSFW", "Spam", "Controversial"];
    private static readonly Random Rng = new();

    public Task<(double totalScore, List<TagScore> tags)> Analyze(string text)
    {
        var tagScores = Tags
            .Where(_ => Rng.NextDouble() > 0.7)   // ~30% chance each tag fires
            .Select(tag => new TagScore
            {
                Id = Guid.NewGuid(),
                Tag = tag,
                Score = Math.Round(Rng.NextDouble() * 100, 1),
                Post = null!   // set by caller after post is created
            })
            .ToList();

        var total = tagScores.Count > 0
            ? Math.Round(tagScores.Average(t => t.Score), 1)
            : Math.Round(Rng.NextDouble() * 20, 1);  // low score if no tags fired

        return Task.FromResult((total, tagScores));
    }
}
