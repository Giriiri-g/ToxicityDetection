using API.Entities;
using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<TagScore> TagScores { get; set; }
        public DbSet<ToxicityConfig> ToxicityConfigs { get; set; }

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

                // Self-referencing relationship for comments
                e.HasOne(p => p.ParentPost)
                 .WithMany(p => p.ChildPosts)
                 .HasForeignKey(p => p.PPID)
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

            // ToxicityConfig — singleton row seeded with defaults
            b.Entity<ToxicityConfig>(e => e.HasKey(c => c.Id));
            b.Entity<ToxicityConfig>().HasData(new ToxicityConfig
            {
                Id = 1,
                TagThresholdsJson = "{\"Hate\":35,\"Threat\":35,\"NSFW\":35,\"Spam\":35,\"Controversial\":35}",
                BlurThreshold = 35.0,
                BlockThreshold = 70.0
            });
        }
    }
}