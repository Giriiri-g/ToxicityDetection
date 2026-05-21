using API.DTOs;

namespace API.Interfaces;

public interface IAuthService
{
    Task<string?> Login(LoginDto dto);
    Task<string?> Register(RegisterDto dto);
}
