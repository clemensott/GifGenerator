using Firebase.Database;
using Firebase.Database.Query;
using GifGenerator.Models.Gifs;
using GifGenerator.Models.Users;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GifGenerator.Models.Categories;

namespace GifGenerator.Helpers
{
    /// <summary>
    /// Firebase Realtime Database Helper: Provides a FirebaseClient and extension methods to perform commen requests.
    /// </summary>
    public static class FbDbHelper
    {
        private const string LoginBaseChild = "Login";
        private static readonly char[] invalidKeyCharacters = GetInvalidKeyCharacters().ToArray();

        private static IEnumerable<char> GetInvalidKeyCharacters()
        {
            return new[] {'.', '$', '#', '[', ']', '/', (char)127}
                .Concat(Enumerable.Range(0, 32).Select(i => (char)i));
        }

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

        public static bool IsValidKey(string key)
        {
            return key.Length > 0 && !key.Any(invalidKeyCharacters.Contains);
        }

        public static async Task<bool> ContainsKeyAsync(this FirebaseQuery query)
        {
            object obj = await query.OnceSingleAsync<object>();
            return obj != null;
        }

        public static Task PutAsync(this FirebaseQuery query)
        {
            return query.PutAsync(true);
        }

        public static ChildQuery UserQuery(this FirebaseClient client, string username)
        {
            return client.Child(nameof(User)).Child(username);
        }

        public static Task<User> GetUserAsync(this FirebaseClient client, string username)
        {
            return client.UserQuery(username).OnceSingleAsync<User>();
        }

        public static ChildQuery UserPasswordQuery(this FirebaseClient client, string username)
        {
            return client.Child(nameof(User)).Child(username).Child(nameof(User.Password));
        }

        public static Task<string> GetUserPasswordAsync(this FirebaseClient client, string username)
        {
            return client.UserPasswordQuery(username).OnceSingleAsync<string>();
        }


        public static ChildQuery UserRootCategoryIdQuery(this FirebaseClient client, string username)
        {
            return client.Child(nameof(User)).Child(username).Child(nameof(User.RootCategoryId));
        }

        public static Task<string> GetUserRootCategoryIdAsync(this FirebaseClient client, string username)
        {
            return client.UserRootCategoryIdQuery(username).OnceSingleAsync<string>();
        }

        public static ChildQuery UserAllCategoriesQuery(this FirebaseClient client, string username)
        {
            return client.UserQuery(username).Child(nameof(User.AllCategoryIds));
        }

        public static ChildQuery UserCategoryQuery(this FirebaseClient client, string username, string categoryId)
        {
            return client.UserAllCategoriesQuery(username).Child(categoryId);
        }

        public static Task<bool> UserContainsCategoryAsync(this FirebaseClient client, string username,
            string categoryId)
        {
            return client.UserCategoryQuery(username, categoryId).ContainsKeyAsync();
        }

        public static ChildQuery LoginsQuery(this FirebaseClient client)
        {
            return client.Child(LoginBaseChild);
        }

        public static Task<Logins> GetLoginsAsync(this FirebaseClient client)
        {
            return client.LoginsQuery().OnceSingleAsync<Logins>();
        }

        public static ChildQuery LoginQuery(this FirebaseClient client, string token)
        {
            return client.Child(LoginBaseChild).Child(token);
        }

        public static Task<string> GetLoginUsernameAsync(this FirebaseClient client, string token)
        {
            return client.LoginQuery(token).OnceSingleAsync<string>();
        }

        public static async Task<string> LoginAsync(this FirebaseClient client, string username)
        {
            FirebaseObject<string> login = await client.LoginsQuery().PostAsync<string>(username);
            return login.Key;
        }

        public static Task LogoutAsync(this FirebaseClient client, string token)
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

        public static Task<Category> GetCategoryAsync(this FirebaseClient client, string id)
        {
            return client.CategoryQuery(id).OnceSingleAsync<Category>();
        }

        public static ChildQuery CategoryNameQuery(this FirebaseClient client, string id)
        {
            return client.CategoryQuery(id).Child(nameof(Category.Name));
        }

        public static Task<string> GetCategoryNameAsync(this FirebaseClient client, string id)
        {
            return client.CategoryQuery(id).Child(nameof(Category.Name)).OnceSingleAsync<string>();
        }

        public static ChildQuery CategoryChildQuery(this FirebaseClient client, string categoryId, string childId)
        {
            return client.CategoryQuery(categoryId).Child(nameof(Category.ChildrenIds)).Child(childId);
        }

        public static Task PutCategoryChildAsync(this FirebaseClient client, string categoryId, string childId)
        {
            return client.CategoryChildQuery(categoryId, childId).PutAsync();
        }

        public static Task DeleteCategoryChildAsync(this FirebaseClient client, string categoryId, string childId)
        {
            return client.CategoryChildQuery(categoryId, childId).DeleteAsync();
        }

        public static ChildQuery CategoryParentQuery(this FirebaseClient client, string id)
        {
            return client.CategoryQuery(id).Child(nameof(Category.ParentId));
        }

        public static Task<string> GetCategoryParentIdAsync(this FirebaseClient client, string categoryId)
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

        public static async Task<string> AddGifAsync(this FirebaseClient client, Gif gif)
        {
            FirebaseObject<Gif> item = await client.GifsQuery().PostAsync(gif);
            return item.Key;
        }

        public static ChildQuery GifQuery(this FirebaseClient client, string gifId)
        {
            return client.GifsQuery().Child(gifId);
        }

        public static Task<Gif> GetGifAsync(this FirebaseClient client, string gifId)
        {
            return client.GifQuery(gifId).OnceSingleAsync<Gif>();
        }

        public static ChildQuery GifCategroyQuery(this FirebaseClient client, string gifId)
        {
            return client.GifQuery(gifId).Child(nameof(Gif.CategoryId));
        }

        public static ChildQuery GifCustomTagQuery(this FirebaseClient client, string gifId)
        {
            return client.GifQuery(gifId).Child(nameof(Gif.CustomTag));
        }
    }
}
