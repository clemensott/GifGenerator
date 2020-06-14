using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using GifGeneratorTest.Helpers;
using GifGeneratorTest.Models;
using Xunit;

namespace GifGeneratorTest.Tests.Category
{
    public class GetCategoryTest : IAsyncLifetime
    {
        private const string username1 = "testUser1", username2 = "testUser2", categoryId = "thisIsTheIdOfOnlyCategory",
            authToken1 = "thisIsTheLoginToken1", authToken2 = "thisIsTheLoginToken2";

        private readonly Database db = Database.Create(
            new DbUser(
                username1,
                new DbLogin(authToken1),
                new DbCategory(categoryId)
            ),
            new DbUser(username2, new DbLogin(authToken2))
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
        public async void GetCategory_CallGetRoot_ReturnCategoryAsync()
        {
            using (HttpResponseMessage response = await Api.GetAsync("api/category/" + categoryId, authToken1))
            {
                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                await CustomAssert.EqualJson(@".\Responses\Category\GetCategory\rootCategoryResponse.json",
                    response.Content);
            }
        }

        [Fact]
        public async void GetCategory_CallGetRootWithWrongAuthToken_ReturnNotFoundAsync()
        {
            using (HttpResponseMessage response = await Api.GetAsync("api/category/" + categoryId, authToken2))
            {
                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        }
    }
}
