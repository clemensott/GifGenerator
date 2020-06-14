using System;

namespace GifGeneratorTest.Models
{
    public class DbLogin
    {
        public string Token { get; set; }

        public DateTimeOffset Expires { get; set; }

        public DbLogin(string token, TimeSpan? expiresIn = null)
        {
            Token = token;
            Expires = DateTimeOffset.Now.Add(expiresIn ?? TimeSpan.FromDays(1));
        }
    }
}
