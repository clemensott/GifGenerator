using System.Linq;
using GifGenerator.Helpers;

namespace GifGenerator.Models.Users
{
    public class UserInfo
    {
        public string Username { get; set; }

        public string RootCategoryId { get; set; }

        public string[] AllCategoryIds { get; set; }

        public UserInfo(string username, User user)
        {
            Username = username;
            RootCategoryId = user.RootCategoryId;
            AllCategoryIds = user.AllCategoryIds?.Keys.ToNotNull().ToArray();
        }
    }
}
