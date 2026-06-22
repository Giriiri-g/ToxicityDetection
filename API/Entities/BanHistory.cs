namespace API.Entities;

public class BanHistory
{
    public Guid TID { get; set;}
    public Guid UID { get; set;}
    public Guid ModID { get; set;}
    public DateTime StartDate { get; set;}
    public DateTime? ExpiryDate { get; set;}
    public string Reason { get; set;} = "";
}