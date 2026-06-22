namespace API.Entities;

public class Like
{
    public Guid PID { get; set;}
    public Guid UID { get; set;}
    public DateTime LikedAt { get; set;}
}