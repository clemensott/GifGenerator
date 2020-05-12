using System.Collections.Generic;

namespace GifGenerator.Models.Users
{
    public class User
    {
        public string Username { get; set; }

        public string Password { get; set; }

        public Dictionary<string, bool> AllCategoryIds { get; set; }

        public User()
        {
            AllCategoryIds = new Dictionary<string, bool>();
        }
    }
}
