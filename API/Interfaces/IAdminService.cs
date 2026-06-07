using API.DTOs;

namespace API.Interfaces;

public interface IAdminService
{
    Task<UserStatsDto> GetUserStats();
    Task<(bool success, string message)> CreateUser(RegisterDto dto);
}
