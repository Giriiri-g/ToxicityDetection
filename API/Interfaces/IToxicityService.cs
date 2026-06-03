using API.Entities;

namespace API.Interfaces;

public interface IToxicityService
{
    /// <summary>Scores the post text and returns populated TagScore entities.</summary>
    Task<(double totalScore, List<TagScore> tags)> Analyze(string text);
}
