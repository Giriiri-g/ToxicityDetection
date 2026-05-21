using API.DTOs;
using API.Interfaces;
using API.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace API.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IConfiguration _config;

    public AuthService(
        IUserRepository userRepository,
        IConfiguration config)
    {
        _userRepository = userRepository;
        _config = config;
    }

    public async Task<string?> Login(LoginDto dto)
    {
        var user = await _userRepository
            .GetByUsername(dto.Username);

        if (user == null)
            return null;


        if (BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash) == false)
            return null;

        var claims = new[]
        {
            new Claim(ClaimTypes.Name, user.UserName),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(
                _config["Jwt:Key"]!
            )
        );

        var creds = new SigningCredentials(
            key,
            SecurityAlgorithms.HmacSha256
        );

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler()
            .WriteToken(token);
    }

    public async Task<string?> Register(RegisterDto dto)
    {
        // uniqueness checks
        if (await _userRepository.UsernameExists(dto.Username))
            return null;

        if (await _userRepository.EmailExists(dto.Email))
            return null;

        var genderBool = ParseGender(dto.Gender);

        var user = new User
        {
            Id = Guid.NewGuid(),
            UserName = dto.Username,
            Email = dto.Email,
            PhoneNumber = dto.PhoneNumber ?? string.Empty,
            Description = dto.Description ?? string.Empty,
            Gender = genderBool,
            DateOfBirth = dto.DateOfBirth ?? default,
            Created = DateOnly.FromDateTime(DateTime.UtcNow),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = dto.Role
        };

        await _userRepository.Add(user);
        await _userRepository.SaveChanges();

        // auto-login: reuse login token generation
        return await Login(new LoginDto
        {
            Username = dto.Username,
            Password = dto.Password
        });
    }

    private static bool ParseGender(string? gender)
    {
        if (string.IsNullOrWhiteSpace(gender))
            return false;

        return gender.Trim().ToLowerInvariant() switch
        {
            "male" => true,
            "female" => false,
            _ => false
        };
    }
}

