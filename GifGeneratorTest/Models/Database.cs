using System.Collections.Generic;
using System.Linq;
using GifGenerator.Models.Categories;
using GifGenerator.Models.Gifs;
using GifGenerator.Models.Users;

namespace GifGeneratorTest.Models
{
    public class Database
    {
        public IDictionary<string, Category> Category { get; set; } = new Dictionary<string, Category>();

        public IDictionary<string, Gif> Gif { get; set; } = new Dictionary<string, Gif>();

        public IDictionary<string, Login> Login { get; set; } = new Dictionary<string, Login>();

        public IDictionary<string, User> User { get; set; } = new Dictionary<string, User>();

        public static Database Create(params DbUser[] users)
        {
            Database db = new Database();

            foreach (DbUser user in users)
            {
                Dictionary<string, bool> allCategoryIds = new Dictionary<string, bool>();
                AddCategoryRecursive(db, null, user.RootCategory, allCategoryIds);

                db.User.Add(user.Username, new User()
                {
                    Password = user.Password ?? "password",
                    RootCategoryId = user.RootCategory?.Id,
                    AllCategoryIds = allCategoryIds,
                });

                if (user.Logins == null) continue;

                foreach (DbLogin login in user.Logins)
                {
                    db.Login.Add(login.Token, new Login()
                    {
                        Username = user.Username,
                        Expires = login.Expires,
                    });
                }
            }

            return db;
        }

        private static void AddCategoryRecursive(Database db, string parentId, DbCategory category,
            IDictionary<string, bool> allCategoryIds)
        {
            if (category == null) return;

            allCategoryIds.Add(category.Id, true);
            db.Category.Add(category.Id, new Category()
            {
                Name = category.Name ?? $"category{allCategoryIds.Count}",
                ParentId = parentId,
                ChildrenIds = category.Children?.ToDictionary(c => c.Id, _ => true),
                GifIds = category.Gifs?.ToDictionary(g => g.Id, _ => true),
            });

            if (category.Gifs != null)
            {
                foreach (DbGif gif in category.Gifs)
                {
                    db.Gif.Add(gif.Id, new Gif()
                    {
                        CategoryId = category.Id,
                        AutoTag = gif.AutoTag,
                        CustomTag = gif.CustomTag,
                        FileSize = gif.FileSize,
                        PixelSize = gif.PixelPixelSize
                    });
                }
            }

            if (category.Children == null) return;

            foreach (DbCategory child in category.Children)
            {
                AddCategoryRecursive(db, category.Id, child, allCategoryIds);
            }
        }
    }
}
