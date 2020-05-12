using Firebase.Database;
using Firebase.Database.Query;
using GifGenerator.Models;
using GifGenerator.Models.Gifs;
using GifGenerator.Models.Users;
using System;
using System.Threading.Tasks;

namespace GifGenerator.Helpers
{
    public static class FbHelper
    {
        private const string LoginBaseChild = "Login";

        private static FirebaseClient instance;

        public static FirebaseClient Client
        {
            get
            {
                if (instance == null)
                {
                    string url = Environment.GetEnvironmentVariable("FIREBASE_REALTIME_URL");
                    string token = Environment.GetEnvironmentVariable("FIREBASE_REALTIME_TOKEN");

                    instance = new FirebaseClient(url, new FirebaseOptions()
                    {
                        AuthTokenAsyncFactory = () => Task.FromResult(token)
                    });
                }

                return instance;
            }
        }

        public static async Task<bool> ContainsKey(this FirebaseQuery query)
        {
            object obj = await query.OnceSingleAsync<object>();
            return obj != null;
        }

        public static ChildQuery UserQuery(this FirebaseClient client, string username)
        {
            return client.Child(nameof(User)).Child(username);
        }

        public static Task<User> GetUser(this FirebaseClient client, string username)
        {
            return client.UserQuery(username).OnceSingleAsync<User>();
        }

        public static ChildQuery UserPasswordQuery(this FirebaseClient client, string username)
        {
            return client.Child(nameof(User)).Child(username).Child(nameof(User.Password));
        }

        public static Task<string> GetUserPassword(this FirebaseClient client, string username)
        {
            return client.UserPasswordQuery(username).OnceSingleAsync<string>();
        }

        public static ChildQuery UserAllCategoriesQuery(this FirebaseClient client, string username)
        {
            return client.UserQuery(username).Child(nameof(User.AllCategoryIds));
        }

        public static ChildQuery UserCategoryQuery(this FirebaseClient client, string username, string categoryId)
        {
            return client.UserAllCategoriesQuery(username).Child(categoryId);
        }

        public static Task<bool> UserContainsCategory(this FirebaseClient client, string username, string categoryId)
        {
            return client.UserCategoryQuery(username, categoryId).ContainsKey();
        }

        public static ChildQuery LoginsQuery(this FirebaseClient client)
        {
            return client.Child(LoginBaseChild);
        }

        public static Task<Logins> GetLogins(this FirebaseClient client)
        {
            return client.LoginsQuery().OnceSingleAsync<Logins>();
        }

        public static ChildQuery LoginQuery(this FirebaseClient client, string token)
        {
            return client.Child(LoginBaseChild).Child(token);
        }

        public static Task<string> GetLoginUsername(this FirebaseClient client, string token)
        {
            return client.LoginQuery(token).OnceSingleAsync<string>();
        }

        public static async Task<string> Login(this FirebaseClient client, string username)
        {
            FirebaseObject<string> login = await client.LoginsQuery().PostAsync<string>(username);
            return login.Key;
        }

        public static Task Logout(this FirebaseClient client, string token)
        {
            return client.LoginQuery(token).DeleteAsync();
        }

        public static ChildQuery CategoriesQuery(this FirebaseClient client)
        {
            return client.Child(nameof(Category));
        }

        public static ChildQuery CategoryQuery(this FirebaseClient client, string id)
        {
            return client.CategoriesQuery().Child(id);
        }

        public static Task<Category> GetCategory(this FirebaseClient client, string id)
        {
            return client.CategoryQuery(id).OnceSingleAsync<Category>();
        }

        public static ChildQuery CategoryNameQuery(this FirebaseClient client, string id)
        {
            return client.CategoryQuery(id).Child(nameof(Category.Name));
        }


        public static ChildQuery CategoryChildQuery(this FirebaseClient client, string categoryId, string childId)
        {
            return client.CategoryQuery(categoryId).Child(nameof(Category.ChildrenIds)).Child(childId);
        }

        public static ChildQuery CategoryParentQuery(this FirebaseClient client, string id)
        {
            return client.CategoryQuery(id).Child(nameof(Category.ParentId));
        }

        public static Task<string> GetCategoryParentId(this FirebaseClient client, string categoryId)
        {
            return client.CategoryParentQuery(categoryId).OnceSingleAsync<string>();
        }

        public static ChildQuery CategoryGifsQuery(this FirebaseClient client, string categoryId)
        {
            return client.CategoryQuery(categoryId).Child(nameof(Category.GifIds));
        }

        public static ChildQuery CategoryGifQuery(this FirebaseClient client, string categoryId, string gifId)
        {
            return client.CategoryGifsQuery(categoryId).Child(gifId);
        }

        public static ChildQuery GifsQuery(this FirebaseClient client)
        {
            return client.Child(nameof(Gif));
        }

        public static async Task<string> AddGif(this FirebaseClient client, Gif gif)
        {
            FirebaseObject<Gif> item = await client.GifsQuery().PostAsync(gif);
            return item.Key;
        }

        public static ChildQuery GifQuery(this FirebaseClient client, string gifId)
        {
            return client.GifsQuery().Child(gifId);
        }

        public static Task<Gif> GetGif(this FirebaseClient client, string gifId)
        {
            return client.GifQuery(gifId).OnceSingleAsync<Gif>();
        }
    }
}
