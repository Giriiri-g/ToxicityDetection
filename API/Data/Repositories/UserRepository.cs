using API.Interfaces;
using API.Models;
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

    public async Task SaveChanges()
    {
        await _context.SaveChangesAsync();
    }
}
