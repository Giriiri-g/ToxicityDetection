using API.DTOs;
using API.Entities;
using API.Interfaces;

namespace API.Services;

public class ReviewerService : IReviewerService
{
    private readonly IPostRepository _posts;
    private readonly IUserRepository _users;

    public ReviewerService(IPostRepository posts, IUserRepository users)
    {
        _posts = posts;
        _users = users;
    }

    public async Task<(List<ReviewPostDto> posts, int totalCount)> GetFlaggedPosts(int page, int pageSize)
    {
        var posts = await _posts.GetFlaggedPosts(page, pageSize);
        var total = await _posts.GetFlaggedPostsCount();
        return (posts.Select(ToDto).ToList(), total);
    }

    public async Task<ReviewPostDetailDto?> GetPostDetail(Guid id)
    {
        var post = await _posts.GetById(id);
        if (post is null) return null;

        var user = await _users.GetByUsername(post.UserName);
        var history = await _posts.GetByUsername(post.UserName);

        return new ReviewPostDetailDto
        {
            PID = post.PID,
            UserName = post.UserName,
            Title = post.Title,
            Message = post.Message,
            MediaUrl = post.MediaUrl,
            LinkUrl = post.LinkUrl,
            CreatedAt = post.CreatedAt,
            TotalToxicityScore = post.TotalToxicityScore,
            TagScores = post.TagScores.Select(t => new TagScoreDto { Tag = t.Tag, Score = t.Score }).ToList(),
            UserJoined = user?.Created ?? DateOnly.MinValue,
            History = history
                .Where(h => h.PID != id)
                .OrderByDescending(h => h.CreatedAt)
                .Select(h => new ReviewHistoryItemDto
                {
                    PID = h.PID,
                    Title = h.Title,
                    TotalToxicityScore = h.TotalToxicityScore,
                    CreatedAt = h.CreatedAt
                })
                .ToList()
        };
    }

    public async Task<(bool success, string message)> ReviewPost(Guid id, ReviewActionDto dto)
    {
        var post = await _posts.GetById(id);
        if (post is null) return (false, "Post not found.");

        if (dto.Approve)
        {
            if (dto.ClearScores)
            {
                await _posts.UpdateTagScores(post, 0, []);
            }
            else if (dto.EditedTags is { Count: > 0 })
            {
                var newTags = dto.EditedTags.Select(tag => new TagScore
                {
                    Id = Guid.NewGuid(),
                    PostId = post.PID,
                    Tag = tag,
                    Score = post.TagScores.FirstOrDefault(t => t.Tag == tag)?.Score ?? 0
                }).ToList();

                var newTotal = newTags.Sum(t => t.Score);
                await _posts.UpdateTagScores(post, newTotal, newTags);
            }
        }
        else
        {
            await _posts.UpdateTagScores(post, 100, post.TagScores.ToList());
        }
        return (true, dto.Approve ? "Post approved." : "Post rejected.");
    }

    public async Task<(bool success, string message)> BanUser(Guid userId, BanUserResponseDto dto, Guid moderatorId)
    {
        // 1. Check if user exists
        var user = await _users.GetById(userId);
        if (user is null) return (false, "User not found.");

        // 2. Check for an existing active ban
        var existingBan = await _users.GetActiveBan(userId);

        bool isPermanent = dto.Unit.Equals("permanent", StringComparison.OrdinalIgnoreCase);

        if (existingBan is not null)
        {
            // Perma-banned users stay perma-banned — no calculation
            if (existingBan.ExpiryDate is null)
                return (false, "User is already permanently banned.");

            if (isPermanent)
            {
                // Escalate existing timed ban to permanent
                await _users.UpdateBanExpiry(existingBan, null);
            }
            else
            {
                // Add duration on top of the current expiry date
                var newExpiry = AddDuration(existingBan.ExpiryDate.Value, dto.Duration, dto.Unit);
                await _users.UpdateBanExpiry(existingBan, newExpiry);
            }
            return (true, isPermanent
                ? "Existing ban escalated to permanent."
                : $"Ban extended by {dto.Duration} {dto.Unit}.");
        }

        // 3. No existing ban — calculate start and expiry dates
        var startDate = DateTime.UtcNow;
        DateTime? endDate = isPermanent ? null : AddDuration(startDate, dto.Duration, dto.Unit);

        // 4. Create and persist the new ban
        var banDto = new BanUserDto
        {
            UserId = userId,
            StartDate = startDate,
            EndDate = endDate,
            Reason = dto.Reason ?? "",
            ModeratorId = moderatorId
        };

        await _users.BanUser(banDto);

        return (true, isPermanent
            ? "User permanently banned."
            : $"User banned until {endDate:u}.");
    }

    public async Task<int> ClearCache()
    {
        return await _users.ClearCache();
    }

    // --- Helpers ---

    private static DateTime AddDuration(DateTime from, int duration, string unit) =>
        unit.ToLowerInvariant() switch
        {
            "days"   => from.AddDays(duration),
            "weeks"  => from.AddDays(duration * 7),
            "months" => from.AddMonths(duration),
            "years"  => from.AddYears(duration),
            _        => throw new ArgumentException($"Unsupported ban unit: {unit}")
        };

    private static ReviewPostDto ToDto(Post p) => new()
    {
        PID = p.PID,
        UserName = p.UserName,
        Title = p.Title,
        Message = p.Message,
        CreatedAt = p.CreatedAt,
        TotalToxicityScore = p.TotalToxicityScore,
        TagScores = p.TagScores.Select(t => new TagScoreDto { Tag = t.Tag, Score = t.Score }).ToList()
    };
}
