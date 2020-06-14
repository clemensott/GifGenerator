using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using MediaTypeHeaderValue = System.Net.Http.Headers.MediaTypeHeaderValue;

namespace GifGeneratorTest.Helpers
{
    public static class Api
    {
        private static string GetUri(string path)
        {
            return $"{Env.Current.ApiUrl.TrimEnd('/')}/{path.TrimStart('/')}";
        }

        public static async Task<HttpStatusCode> GetCodeAsync(string path, string authToken = null)
        {
            using (HttpResponseMessage response = await Request(path, HttpMethod.Get, null, authToken))
            {
                return response.StatusCode;
            }
        }

        public static async Task<HttpResponseMessage> GetAsync(string path, string authToken = null)
        {
            return await Request(path, HttpMethod.Get, null, authToken);
        }

        public static async Task<HttpResponseMessage> PostAsync(string path, object body = null,
            string authToken = null)
        {
            return await Request(path, HttpMethod.Post, body, authToken);
        }

        public static async Task<HttpStatusCode> PostCodeAsync(string path, object body = null, string authToken = null)
        {
            using (HttpResponseMessage response = await Request(path, HttpMethod.Post, body, authToken))
            {
                return response.StatusCode;
            }
        }

        public static async Task<HttpResponseMessage> PutAsync(string path, object body = null,
            string authToken = null)
        {
            return await Request(path, HttpMethod.Put, body, authToken);
        }

        public static async Task<HttpStatusCode> PutCodeAsync(string path, object body = null, string authToken = null)
        {
            using (HttpResponseMessage response = await Request(path, HttpMethod.Put, body, authToken))
            {
                return response.StatusCode;
            }
        }

        private static async Task<HttpResponseMessage> Request(string path, HttpMethod method,
            object body = null, string authToken = null)
        {
            using (HttpClient client = new HttpClient())
            {
                using (HttpRequestMessage request = new HttpRequestMessage(method, GetUri(path)))
                {
                    if (body != null)
                    {
                        HttpContent content = new StringContent(JsonConvert.SerializeObject(body));
                        content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
                        request.Content = content;
                    }

                    if (!string.IsNullOrWhiteSpace(authToken))
                    {
                        request.Headers.Add("auth", authToken);
                    }

                    return await client.SendAsync(request);
                }
            }
        }

        public static async Task<JToken> ReadAsJsonAsync(this HttpContent content)
        {
            string json = await content.ReadAsStringAsync();
            return (JToken)JsonConvert.DeserializeObject(json);
        }
    }
}
