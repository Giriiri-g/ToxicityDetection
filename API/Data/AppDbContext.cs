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
        public DbSet<Ban> Bans { get; set; }
        public DbSet<BanHistory> BanHistories { get; set; }
        public DbSet<Like> Likes { get; set; }

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

            // Ban
            b.Entity<Ban>(e =>
            {
                e.HasKey(b => b.TID);

                e.HasOne(b => b.User)
                 .WithMany()
                 .HasForeignKey(b => b.UID)
                 .OnDelete(DeleteBehavior.Restrict);

                e.HasOne(b => b.Moderator)
                 .WithMany()
                 .HasForeignKey(b => b.ModID)
                 .OnDelete(DeleteBehavior.Restrict);
            });

            b.Entity<BanHistory>(e =>
            {
                e.HasKey(h => h.TID);
            });

            b.Entity<ToxicityConfig>(e => e.HasKey(c => c.Id));
            b.Entity<ToxicityConfig>().HasData(new ToxicityConfig
            {
                Id = 1,
                TagThresholdsJson = "{\"Hate\":35,\"Threat\":35,\"NSFW\":35,\"Spam\":35,\"Controversial\":35}",
                BlurThreshold = 35.0,
                BlockThreshold = 70.0
            });

            // Like
            b.Entity<Like>(entity =>
            {
                entity.HasKey(l => new { l.PID, l.UID });
                entity.Property(l => l.LikedAt)
                    .IsRequired();
                entity.HasIndex(l => l.UID);
                entity.HasIndex(l => l.PID);
            });
        }
    }
}
