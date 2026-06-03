using API.Entities;
using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Post> Posts { get; set; }
    public DbSet<TagScore> TagScores { get; set; }

    protected override void OnModelCreating(ModelBuilder b)
    {
        // Post
        b.Entity<Post>(e =>
        {
            e.HasKey(p => p.PID);
            e.HasOne(p => p.User)
             .WithMany()
             .HasForeignKey(p => p.UserName)
             .HasPrincipalKey(u => u.UserName)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // TagScore
        b.Entity<TagScore>(e =>
        {
            e.HasKey(t => t.Id);
            e.HasOne(t => t.Post)
             .WithMany(p => p.TagScores)
             .HasForeignKey(t => t.PostId)
             .HasPrincipalKey(p => p.PID)
             .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
