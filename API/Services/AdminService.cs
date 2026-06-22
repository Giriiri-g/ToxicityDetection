using API.DTOs;
using API.Entities;
using API.Interfaces;
using API.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace API.Services;

public class AdminService : IAdminService
{
    private readonly IUserRepository _userRepository;
    private readonly IAuthService _authService;
    private readonly IPostRepository _postRepository;
    private readonly AppDbContext _db;
    private static bool _threadUpdatePerformed = false;

    public AdminService(IUserRepository userRepository, IAuthService authService, IPostRepository postRepository, AppDbContext db)
    {
        _userRepository = userRepository;
        _authService = authService;
        _postRepository = postRepository;
        _db = db;
    }

    public async Task<UserStatsDto> GetUserStats()
    {
        var created = await _userRepository.GetAllCreatedDates();

        var now = DateOnly.FromDateTime(DateTime.UtcNow);

        var newThisMonth = created.Count(d => d.Year == now.Year && d.Month == now.Month);

        var growth = Enumerable.Range(0, 12)
            .Select(i =>
            {
                var d = now.AddMonths(-11 + i);
                return new GrowthPointDto(
                    d.ToString("MMM yy"),
                    created.Count(c => c.Year == d.Year && c.Month == d.Month)
                );
            })
            .ToList();

        return new UserStatsDto(created.Count, newThisMonth, growth);
    }

    public async Task<(bool success, string message)> CreateUser(RegisterDto dto)
    {
        if (dto.Role != "User" && dto.Role != "Reviewer" && dto.Role != "Admin")
            return (false, "Role must be 'User', 'Reviewer', or 'Admin'.");

        var token = await _authService.Register(dto);
        if (token == null)
            return (false, "Username or email already exists.");

        return (true, $"{dto.Role} account '{dto.Username}' created.");
    }

    public async Task<ToxicityStatsDto> GetToxicityStats(int days = 30)
    {
        var total = await _postRepository.GetTotalPostCount();
        var byTag = await _postRepository.GetFlaggedCountByTag();
        var trendRaw = await _postRepository.GetDailyTrend(days);

        var dto = new ToxicityStatsDto
        {
            TotalPosts = total,
            FlaggedPosts = byTag.Sum(t => t.Count),
            TagCounts = byTag.Select(t => new TagStatDto(t.Tag, t.Count)).ToList(),
            Trend = trendRaw.Select(t => new TrendPointDto(t.Date.ToString("yyyy-MM-dd"), t.NewPosts, t.FlaggedPosts)).ToList()
        };

        return dto;
    }

    public async Task<ToxicityThresholdsDto> GetThresholds()
    {
        var cfg = await _db.ToxicityConfigs.FirstOrDefaultAsync(c => c.Id == 1) ?? new ToxicityConfig();
        var tags = new Dictionary<string, double>(StringComparer.OrdinalIgnoreCase);
        try
        {
            if (!string.IsNullOrWhiteSpace(cfg.TagThresholdsJson))
                tags = JsonSerializer.Deserialize<Dictionary<string, double>>(cfg.TagThresholdsJson) ?? tags;
        }
        catch { }

        return new ToxicityThresholdsDto
        {
            TagThresholds = tags,
            BlurThreshold = cfg.BlurThreshold,
            BlockThreshold = cfg.BlockThreshold
        };
    }

    public async Task SetThresholds(ToxicityThresholdsDto dto)
    {
        var cfg = await _db.ToxicityConfigs.FirstOrDefaultAsync(c => c.Id == 1);
        if (cfg == null)
        {
            cfg = new ToxicityConfig { Id = 1 };
            _db.ToxicityConfigs.Add(cfg);
        }

        cfg.TagThresholdsJson = JsonSerializer.Serialize(dto.TagThresholds);
        cfg.BlurThreshold = dto.BlurThreshold;
        cfg.BlockThreshold = dto.BlockThreshold;

        await _db.SaveChangesAsync();
    }

    public async Task<List<ThreadRankDto>> GetTrendingThreads(int top = 10, int days = 14)
    {
        // Ensure that any existing posts with null thread are updated to have a default thread
        if (!_threadUpdatePerformed)
        {
            var postsWithNullThread = await _db.Posts.Where(p => p.Thread == null).ToListAsync();
            if (postsWithNullThread.Any())
            {
                foreach (var post in postsWithNullThread)
                {
                    post.Thread = "General";
                }
                await _db.SaveChangesAsync();
            }
            _threadUpdatePerformed = true;
        }

        var rankings = await _postRepository.GetThreadRankings();
        var topThreads = rankings.Take(top).ToList();
        var since = DateTime.UtcNow.Date.AddDays(-(days - 1));

        var result = new List<ThreadRankDto>();
        foreach (var (thread, count) in topThreads)
        {
            var posts = await _db.Posts
                .Where(p => p.Thread == thread && p.PPID == null && p.CreatedAt >= since)
                .Select(p => p.CreatedAt)
                .ToListAsync();

            var trend = Enumerable.Range(0, days)
                .Select(i =>
                {
                    var day = since.AddDays(i);
                    var newPosts = posts.Count(d => d.Date == day);
                    return new TrendPointDto(day.ToString("yyyy-MM-dd"), newPosts, 0);
                })
                .ToList();

            result.Add(new ThreadRankDto(thread, count, trend));
        }

        return result;
    }
}
