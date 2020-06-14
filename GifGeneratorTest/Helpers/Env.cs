using System;
using System.IO;
using Newtonsoft.Json;

namespace GifGeneratorTest.Helpers
{
    public struct Env
    {
        public static Env Current { get; } = LoadConfig();

        private static Env LoadConfig()
        {
            string json;
            try
            {
                json = File.ReadAllText("env.json");
            }
            catch (FileNotFoundException e)
            {
                throw new Exception("Env file is missing", e);
            }
            catch (Exception e)
            {
                throw new Exception("Reading env file failed", e);
            }

            try
            {
                return JsonConvert.DeserializeObject<Env>(json);
            }
            catch (Exception e)
            {
                throw new Exception("Deserializing env file failed", e);
            }
        }

        public string ApiUrl { get; set; }

        public string FirebaseApiKey { get; set; }

        public string FirebaseAuthEmail { get; set; }

        public string FirebaseAuthPassword { get; set; }

        public string FirebaseBucketUrl { get; set; }

        public string FirebaseRealtimeToken { get; set; }

        public string FirebaseRealtimeUrl { get; set; }
    }
}
