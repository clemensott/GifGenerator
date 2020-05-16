using Firebase.Auth;
using Firebase.Storage;
using GifGenerator.Models.Gifs;
using System;
using System.IO;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace GifGenerator.Helpers
{
    /// <summary>
    /// Firebase Storage Helper: Provides a FirebaseClient and extension methods to perform commen requests.
    /// </summary>
    public static class FbSgHelper
    {
        private static FirebaseAuthLink authLink;
        private static Task loginTask;
        private static FirebaseStorage instance;

        public static FirebaseStorage Client
        {
            get
            {
                if (instance == null)
                {
                    string url = Environment.GetEnvironmentVariable("FIREBASE_BUCKET_URL");

                    instance = new FirebaseStorage(url, new FirebaseStorageOptions()
                    {
                        AuthTokenAsyncFactory = GetAuthKeyAsync
                    });
                }

                return instance;
            }
        }

        private static async Task<string> GetAuthKeyAsync()
        {
            if (authLink == null || authLink.IsExpired())
            {
                if (loginTask == null || loginTask.IsCompleted) loginTask = Login();

                await loginTask;
            }

            return authLink.FirebaseToken;

            async Task Login()
            {
                string key = Environment.GetEnvironmentVariable("FIREBASE_API_KEY");
                string email = Environment.GetEnvironmentVariable("FIREBASE_AUTH_EMAIL");
                string password = Environment.GetEnvironmentVariable("FIREBASE_AUTH_PASSWORD");

                FirebaseAuthProvider auth = new FirebaseAuthProvider(new FirebaseConfig(key));
                authLink = await auth.SignInWithEmailAndPasswordAsync(email, password);
            }
        }

        public static FirebaseStorageReference GifsQuery(this FirebaseStorage client)
        {
            return client.Child(nameof(Gif));
        }

        public static FirebaseStorageReference GifQuery(this FirebaseStorage client, string gifId)
        {
            return client.GifsQuery().Child(gifId + ".gif");
        }

        public static FirebaseStorageTask PutGifAsync(this FirebaseStorage client, string gifId, Stream stream)
        {
            return client.GifQuery(gifId).PutAsync(stream, CancellationToken.None, "image/gif");
        }

        public static Task<string> GetGifDownloadUrlAsync(this FirebaseStorage client, string gifId)
        {
            return client.GifQuery(gifId).GetDownloadUrlAsync();
        }

        public static async Task<Stream> GetGifStreamAsync(this FirebaseStorage client, string gifId)
        {
            string url = await client.GetGifDownloadUrlAsync(gifId);

            HttpClient httpClient = new HttpClient();
            return await httpClient.GetStreamAsync(url);
        }
    }
}