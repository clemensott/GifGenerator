using System;

namespace GifGenerator.Models.Users
{
    public class LoginInfo
    {
        public string Token { get; set; }

        public DateTimeOffset Expires { get; set; }

        public LoginInfo(string token, DateTimeOffset expires)
        {
            Token = token;
            Expires = expires;
        }
    }
}
