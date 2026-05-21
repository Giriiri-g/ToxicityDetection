using API.Models;

namespace API.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByUsername(string username);
    Task<User?> GetByEmail(string email);

    Task<bool> UsernameExists(string username);
    Task<bool> EmailExists(string email);

    Task Add(User user);

    Task SaveChanges();
}
