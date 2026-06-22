using API.Entities;
using API.Models;
using API.DTOs;

namespace API.Interfaces;

public interface IUserRepository{
    Task<User?> GetByUsername(string username);
    Task<User?> GetByEmail(string email);
    Task<bool> UsernameExists(string username);
    Task<bool> EmailExists(string email);
    Task<List<DateOnly>> GetAllCreatedDates();
    Task<DateOnly?> GetJoinDate(string username);
    Task Add(User user);
    Task BanUser(BanUserDto dto);
    Task<int> ClearCache();
    Task<API.Entities.Ban?> GetActiveBan(Guid userId);
    Task UpdateBanExpiry(Ban existingBan, DateTime? newExpiry);
    Task<User?> GetById(Guid id);


    Task SaveChanges();}
