using System.Collections.Generic;

namespace GifGeneratorTest.Models
{
    public class DbUser
    {
        public string Username { get; set; }

        public string Password { get; set; }

        public DbCategory RootCategory { get; set; }

        public IEnumerable<DbLogin> Logins { get; set; }

        public DbUser() { }

        public DbUser(string username, DbLogin login = null, DbCategory rootCategory = null,
            string password = default(string))
        {
            Username = username;
            Password = password;
            RootCategory = rootCategory;
            if (login != null) Logins = new[] {login};
        }
    }
}
