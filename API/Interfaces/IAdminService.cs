using API.DTOs;

namespace API.Interfaces;

public interface IAdminService
{
    Task<UserStatsDto> GetUserStats();
    Task<(bool success, string message)> CreateUser(RegisterDto dto);
    Task<ToxicityStatsDto> GetToxicityStats(int days = 30);
    Task<ToxicityThresholdsDto> GetThresholds();
    Task SetThresholds(ToxicityThresholdsDto dto);
    Task<List<ThreadRankDto>> GetTrendingThreads(int top = 10, int days = 14);
}
