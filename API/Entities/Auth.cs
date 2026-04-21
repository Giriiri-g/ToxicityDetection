using System;

namespace API.Entities;

public class Auth
{
    public required string UserName { get; set; } // Used Username instead of Id from AppUser since Id is permanent and will be random, while Username is what users will use to login and can be changed in the future if needed. This also allows us to easily query Auth by Username without needing to join with AppUser first.
    public required string PasswordHash { get; set; }
    public required AppUser User { get; set; }
}
