using System;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using GifGenerator.Models.Users;
using GifGeneratorTest.Helpers;
using GifGeneratorTest.Models;
using Newtonsoft.Json.Linq;
using Xunit;

namespace GifGeneratorTest.Tests.Auth
{
    public class LoginTest : IAsyncLifetime
    {
        private const string username = "testUsername", password = "safePassword";

        private readonly Database db = Database.Create(new[]
        {
            new DbUser(username, password: password)
        });

        public Task InitializeAsync()
        {
            return FbDbHelper.SetDatabase(db);
        }

        public Task DisposeAsync()
        {
            return FbDbHelper.ClearDatabase();
        }

        [Fact]
        public async void LoginTest_CallLogin_ReturnLoginAsync()
        {
            LoginBody body = new LoginBody()
            {
                Username = username,
                Password = password
            };

            using (HttpResponseMessage response = await Api.PostAsync("api/auth/login", body))
            {
                Assert.Equal(HttpStatusCode.OK, response.StatusCode);

                JToken json = await response.Content.ReadAsJsonAsync();
                Assert.False(string.IsNullOrWhiteSpace(json["token"].Value<string>()));
                Assert.True(json["expires"].Value<DateTime>() > DateTime.Now);
            }
        }

        [Fact]
        public async void LoginTest_CallLoginWithInvalidPassword_ReturnBadRequestAsync()
        {
            LoginBody body = new LoginBody()
            {
                Username = username,
                Password = "wrongPassword"
            };

            using (HttpResponseMessage response = await Api.PostAsync("api/auth/login", body))
            {
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            }
        }
    }
}
