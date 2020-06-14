using System.Threading.Tasks;
using Firebase.Database;
using Firebase.Database.Query;
using GifGeneratorTest.Models;
using Newtonsoft.Json;

namespace GifGeneratorTest.Helpers
{
    public static class FbDbHelper
    {
        private static FirebaseClient instance;

        private static FirebaseClient Client
        {
            get
            {
                if (instance == null)
                {
                    string url = Env.Current.FirebaseRealtimeUrl;
                    string token = Env.Current.FirebaseRealtimeToken;

                    instance = new FirebaseClient(url, new FirebaseOptions()
                    {
                        AuthTokenAsyncFactory = () => Task.FromResult(token)
                    });
                }

                return instance;
            }
        }

        public static Task SetDatabase(Database db)
        {
            string json = JsonConvert.SerializeObject(db);
            
            return Client.Child("").PutAsync(db);
        }

        public static Task ClearDatabase()
        {
            return SetDatabase(new Database());
        }
    }
}
