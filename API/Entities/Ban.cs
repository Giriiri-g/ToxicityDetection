using API.Models;
namespace API.Entities;

public class Ban
{
    public Guid TID { get; set;}
    public Guid UID { get; set;}
    public Guid ModID { get; set;}
    public DateTime StartDate { get; set;}
    public DateTime? ExpiryDate { get; set;}
    public string Reason { get; set;} = "";
    public User? User { get; set; }
    public User? Moderator { get; set; }
}