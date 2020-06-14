using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using GifGeneratorTest.Helpers;
using GifGeneratorTest.Models;
using Xunit;

namespace GifGeneratorTest.Tests.Gif
{
    public class GetGifTest : IAsyncLifetime
    {
        private const string username1 = "testUser1", username2 = "testUser2", categoryId = "thisIsTheIdOfOnlyCategory",
            authToken1 = "thisIsTheLoginToken1", authToken2 = "thisIsTheLoginToken2", gifId = "thisIsTheGifId";

        private readonly Database db = Database.Create(
            new DbUser(
                username1,
                new DbLogin(authToken1),
                new DbCategory(
                    categoryId,
                    gif: new DbGif(gifId, 341598, 477, 398)
                )
            ),
            new DbUser(username2, new DbLogin(authToken2))
        );

        private readonly Storage storage = Storage.Create((gifId, @".\TestFiles\test.gif"));

        public Task InitializeAsync()
        {
            return Task.WhenAll(FbDbHelper.SetDatabase(db), FbSgHelper.SetStorage(storage));
        }

        public Task DisposeAsync()
        {
            return Task.WhenAll(FbDbHelper.ClearDatabase(), FbSgHelper.ClearStorage(storage));
        }

        [Fact]
        public async void GetGif_CallExistingGif_ReturnGifAsync()
        {
            using (HttpResponseMessage response = await Api.GetAsync("api/gif/" + gifId, authToken1))
            {
                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                Assert.Equal("image/gif", response.Content.Headers.ContentType.MediaType);
                await CustomAssert.EqualFile(@".\TestFiles\test.gif", response.Content);
            }
        }

        [Fact]
        public async void GetGif_CallNotExistingGif_ReturnNotFoundAsync()
        {
            HttpStatusCode responseCode = await Api.GetCodeAsync("api/gif/notExistingGifId", authToken1);
            Assert.Equal(HttpStatusCode.NotFound, responseCode);
        }

        [Fact]
        public async void GetGif_CallExistingGifWithWrongUser_ReturnNotFoundAsync()
        {
            HttpStatusCode responseCode = await Api.GetCodeAsync("api/gif/" + gifId, authToken2);
            Assert.Equal(HttpStatusCode.NotFound, responseCode);
        }
    }
}
