using API.Interfaces;
using API.Models;
using API.Entities;
using API.DTOs;
using Microsoft.EntityFrameworkCore;

namespace API.Data.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByUsername(string username)
    {
        return await _context.Users
            .FirstOrDefaultAsync(x => x.UserName == username);
    }

    public async Task<User?> GetById(Guid id)
    {
        return await _context.Users
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task<User?> GetByEmail(string email)
    {
        return await _context.Users
            .FirstOrDefaultAsync(x => x.Email == email);
    }

    public async Task<bool> UsernameExists(string username)
    {
        return await _context.Users.AnyAsync(x => x.UserName == username);
    }

    public async Task<bool> EmailExists(string email)
    {
        return await _context.Users.AnyAsync(x => x.Email == email);
    }

    public async Task Add(User user)
    {
        await _context.Users.AddAsync(user);
    }

    public async Task<List<DateOnly>> GetAllCreatedDates()
    {
        return await _context.Users.Select(u => u.Created).ToListAsync();
    }

    public async Task<DateOnly?> GetJoinDate(string username) =>
        await _context.Users
            .Where(u => u.UserName == username)
            .Select(u => (DateOnly?)u.Created)
            .FirstOrDefaultAsync();

    public async Task<Ban?> GetActiveBan(Guid userId)
    {
        return await _context.Bans
            .Where(b => b.UID == userId &&
                        (b.ExpiryDate == null || b.ExpiryDate > DateTime.UtcNow))
            .FirstOrDefaultAsync();
    }

    public async Task BanUser(BanUserDto dto)
    {
        var ban = new Ban
        {
            TID = Guid.NewGuid(),
            UID = dto.UserId,
            StartDate = dto.StartDate,
            ExpiryDate = dto.EndDate,   // null for permanent bans
            Reason = dto.Reason,
            ModID = dto.ModeratorId
        };

        await _context.Bans.AddAsync(ban);
    }

    public async Task UpdateBanExpiry(Ban existingBan, DateTime? newExpiry)
    {
        existingBan.ExpiryDate = newExpiry;
        _context.Bans.Update(existingBan);
        await Task.CompletedTask;
    }

    public async Task<int> ClearCache()
    {
        var expiredBans = await _context.Bans
            .Where(b => b.ExpiryDate != null && b.ExpiryDate < DateTime.UtcNow)
            .ToListAsync();

        if (expiredBans.Count == 0) return 0;

        var history = expiredBans.Select(b => new BanHistory
        {
            TID = b.TID,
            UID = b.UID,
            StartDate = b.StartDate,
            ExpiryDate = b.ExpiryDate,
            Reason = b.Reason,
            ModID = b.ModID
        }).ToList();

        _context.Bans.RemoveRange(expiredBans);
        await _context.BanHistories.AddRangeAsync(history);
        await _context.SaveChangesAsync();

        return expiredBans.Count;
    }

    public async Task SaveChanges() { await _context.SaveChangesAsync(); }
}
