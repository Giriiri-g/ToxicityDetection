using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using API.Entities;
using API.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace API.Services;

public class ToxicityService : IToxicityService
{
    private readonly HttpClient _http;
    private readonly string _apiKey;
    private readonly ILogger<ToxicityService> _logger;

    private const string GroqApiUrl =
        "https://api.groq.com/openai/v1/chat/completions";

    private const string Model =
        "openai/gpt-oss-safeguard-20b";

    private static readonly string[] SupportedTags =
    [
        "Hate",
        "Threat",
        "NSFW",
        "Spam",
        "Controversial"
    ];

    public ToxicityService(
        IConfiguration config,
        IHttpClientFactory httpClientFactory,
        ILogger<ToxicityService> logger)
    {
        _http = httpClientFactory.CreateClient();
        _logger = logger;

        _apiKey = config["Groq:ApiKey"]
            ?? throw new InvalidOperationException(
                "Groq:ApiKey is not configured.");
    }

    public async Task<(double totalScore, List<TagScore> tags)> Analyze(string text)
    {
        try
        {
            var payload = new
            {
                model = Model,
                temperature = 0,
                response_format = new
                {
                    type = "json_object"
                },
                messages = new object[]
                {
                    new
                    {
                        role = "system",
                        content =
"""
You are a content moderation classifier.

Analyze the user's text and score each category from 0 to 100.

Categories:
- Hate
- Threat
- NSFW
- Spam
- Controversial

Scoring Guidelines:
0 = no indication
25 = weak indication
50 = moderate indication
75 = strong indication
100 = explicit/extreme presence

Return ALL categories.

Return ONLY valid JSON.

Example:
{
  "Hate": 0,
  "Threat": 0,
  "NSFW": 0,
  "Spam": 0,
  "Controversial": 0
}
"""
                    },
                    new
                    {
                        role = "user",
                        content = text
                    }
                }
            };

            var request = new HttpRequestMessage(
                HttpMethod.Post,
                GroqApiUrl);

            request.Headers.Authorization =
                new AuthenticationHeaderValue(
                    "Bearer",
                    _apiKey);

            request.Content = new StringContent(
                JsonSerializer.Serialize(payload),
                Encoding.UTF8,
                "application/json");

            var response = await _http.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                var error =
                    await response.Content.ReadAsStringAsync();

                _logger.LogWarning(
                    "GPT-OSS-Safeguard returned {Status}: {Body}",
                    (int)response.StatusCode,
                    error);

                return FallbackScores();
            }

            var responseJson =
                await response.Content.ReadAsStringAsync();

            using var root =
                JsonDocument.Parse(responseJson);

            var content = root.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString() ?? "{}";

            return ParseScores(content);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Moderation request failed.");

            return FallbackScores();
        }
    }

    private static (double totalScore, List<TagScore> tags)
        ParseScores(string jsonContent)
    {
        using var doc =
            JsonDocument.Parse(jsonContent);

        var tagScores = new List<TagScore>();

        foreach (var tag in SupportedTags)
        {
            double score = 0;

            if (doc.RootElement.TryGetProperty(
                tag,
                out var property))
            {
                if (property.ValueKind == JsonValueKind.Number)
                {
                    score = property.GetDouble();
                }
            }

            score = Math.Clamp(score, 0, 100);

            tagScores.Add(new TagScore
            {
                Id = Guid.NewGuid(),
                Tag = tag,
                Score = score,
                Post = null!
            });
        }

        var totalScore =
            Math.Round(
                tagScores.Average(t => t.Score),
                1);

        return (totalScore, tagScores);
    }

    private static readonly Random Rng = new();

    private static (double totalScore, List<TagScore> tags)
        FallbackScores()
    {
        var tagScores = SupportedTags
            .Select(tag => new TagScore
            {
                Id = Guid.NewGuid(),
                Tag = tag,
                Score = Math.Round(
                    Rng.NextDouble() * 100,
                    1),
                Post = null!
            })
            .ToList();

        var totalScore =
            Math.Round(
                tagScores.Average(t => t.Score),
                1);

        return (totalScore, tagScores);
    }
}