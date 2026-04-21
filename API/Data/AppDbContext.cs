using System;
using API.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public DbSet<AppUser> Users { get; set; }
    public DbSet<Auth> Auths { get; set; }
    public DbSet<Post> Posts { get; set; }
    public DbSet<TagScore> TagScores { get; set; }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // =========================
        // AppUser
        // =========================
        modelBuilder.Entity<AppUser>(entity =>
        {
            entity.HasKey(u => u.UserName);

            entity.Property(u => u.UserName)
                  .HasMaxLength(100);

            entity.Property(u => u.Email).IsRequired();
            entity.Property(u => u.PhoneNumber).IsRequired();

            entity.HasMany(u => u.Posts)
                  .WithOne(p => p.User)
                  .HasForeignKey(p => p.UserName);
        });

        // =========================
        // Auth (1-1)
        // =========================
        modelBuilder.Entity<Auth>(entity =>
        {
            entity.HasKey(a => a.UserName);

            entity.Property(a => a.PasswordHash)
                  .IsRequired();

            entity.HasOne(a => a.User)
                  .WithOne(u => u.Auth)
                  .HasForeignKey<Auth>(a => a.UserName);
        });

        // =========================
        // Post
        // =========================
        modelBuilder.Entity<Post>(entity =>
        {
            entity.HasKey(p => p.PID);

            entity.Property(p => p.Title)
                  .HasMaxLength(200);

            entity.Property(p => p.Message)
                  .IsRequired()
                  .HasMaxLength(1000);

            entity.HasOne(p => p.User)
                  .WithMany(u => u.Posts)
                  .HasForeignKey(p => p.UserName);

            entity.HasMany(p => p.TagScores)
                  .WithOne(t => t.Post)
                  .HasForeignKey(t => t.PostId);

            entity.HasOne<Post>()
                  .WithMany()
                  .HasForeignKey(p => p.PPID)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // =========================
        // TagScore
        // =========================
        modelBuilder.Entity<TagScore>(entity =>
        {
            entity.HasKey(t => t.Id);

            entity.Property(t => t.Tag)
                  .IsRequired()
                  .HasMaxLength(50);

            entity.Property(t => t.Score)
                  .IsRequired();
        });
    }
}