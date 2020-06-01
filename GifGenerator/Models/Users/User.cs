using System.Collections.Generic;

namespace GifGenerator.Models.Users
{
    public class User
    {
        public string Password { get; set; }
        
        public string RootCategoryId { get; set; }

        public Dictionary<string, bool> AllCategoryIds { get; set; }

        public User()
        {
            AllCategoryIds = new Dictionary<string, bool>();
        }
    }
}
