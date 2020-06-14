using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Firebase.Auth;
using Firebase.Storage;
using GifGeneratorTest.Models;

namespace GifGeneratorTest.Helpers
{
    public static class FbSgHelper
    {
        private static FirebaseStorage GetClient()
        {
            string url = Env.Current.FirebaseBucketUrl;

            return new FirebaseStorage(url, new FirebaseStorageOptions()
            {
                AuthTokenAsyncFactory = GetAuthKeyAsync
            });
        }

        private static async Task<string> GetAuthKeyAsync()
        {
            string key = Env.Current.FirebaseApiKey;
            string email = Env.Current.FirebaseAuthEmail;
            string password = Env.Current.FirebaseAuthPassword;

            FirebaseAuthProvider auth = new FirebaseAuthProvider(new FirebaseConfig(key));
            FirebaseAuthLink authLink = await auth.SignInWithEmailAndPasswordAsync(email, password);
            return authLink.FirebaseToken;
        }

        public static async Task SetStorage(Storage storage)
        {
            FirebaseStorage client = GetClient();
            foreach (KeyValuePair<string, string> pair in storage.Gif)
            {
                using (Stream stream = File.OpenRead(pair.Value))
                {
                    await client.Child(nameof(Storage.Gif)).Child(pair.Key).PutAsync(stream);
                }
            }
        }

        public static async Task ClearStorage(Storage storage)
        {
            FirebaseStorage client = GetClient();
            foreach (KeyValuePair<string, string> pair in storage.Gif)
            {
                await client.Child(nameof(Storage.Gif)).Child(pair.Key).DeleteAsync();
            }
        }
    }
}
