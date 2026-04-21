using System;

namespace API.Entities;

public class TagScore
{
    public Guid Id { get; set; }

    public Guid PostId { get; set; }

    public required string Tag { get; set; } // nsfw, threat, etc.
    public double Score { get; set; }

    // Navigation
    public required Post Post { get; set; }
}