using API.DTOs;
using API.Interfaces;

namespace API.Services;

public class AdminService : IAdminService
{
    private readonly IUserRepository _userRepository;
    private readonly IAuthService _authService;

    public AdminService(IUserRepository userRepository, IAuthService authService)
    {
        _userRepository = userRepository;
        _authService = authService;
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
        if (dto.Role != "User" && dto.Role != "Reviewer")
            return (false, "Role must be 'User' or 'Reviewer'.");

        var token = await _authService.Register(dto);
        if (token == null)
            return (false, "Username or email already exists.");

        return (true, $"{dto.Role} account '{dto.Username}' created.");
    }
}
