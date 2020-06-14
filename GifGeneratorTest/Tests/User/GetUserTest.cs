using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using GifGeneratorTest.Helpers;
using GifGeneratorTest.Models;
using Xunit;

namespace GifGeneratorTest.Tests.User
{
    public class GetUserTest : IAsyncLifetime
    {
        private const string username = "testUser", authToken = "thisIsTheLoginToken";

        private readonly Database db = Database.Create(
            new DbUser(username, new DbLogin(authToken))
        );

        public Task InitializeAsync()
        {
            return FbDbHelper.SetDatabase(db);
        }

        public Task DisposeAsync()
        {
            return FbDbHelper.ClearDatabase();
        }

        [Fact]
        public async void GetUser_CallGetCurrentUser_ReturnUserAsync()
        {
            using (HttpResponseMessage response = await Api.GetAsync("api/user", authToken))
            {
                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                await CustomAssert.EqualJson(@".\Responses\User\GetUser\userResponse.json", response.Content);
            }
        }

        [Fact]
        public async void GetUser_CallGetCurrentUserWithInvalidToken_ReturnUserAsync()
        {
            using (HttpResponseMessage response = await Api.GetAsync("api/user", "invalidToken"))
            {
                Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
            }
        }
    }
}
