using System;

namespace GifGenerator.Models.Users
{
    public class Login
    {
        public string Username { get; set; }
        
        public DateTimeOffset Expires { get; set; } 
    }
}
