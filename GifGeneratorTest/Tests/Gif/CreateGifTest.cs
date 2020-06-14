using System;
using System.IO;
using System.Net;
using System.Net.Http;
using GifGenerator.Models.Gifs;
using GifGeneratorTest.Helpers;
using SixLabors.ImageSharp;
using Xunit;

namespace GifGeneratorTest.Tests.Gif
{
    public class GifCreateTest
    {
        [Fact]
        public async void CreateGif_CallWithGifCreateBody_ReturnGifAsync()
        {
            byte[] bytes = await File.ReadAllBytesAsync(@".\TestFiles\test.gif");
            string base64String = Convert.ToBase64String(bytes);
            GifCreateBody gif = new GifCreateBody
            {
                Size = new Size(300, 300),
                Sources = new GifCreateSource[] {new GifCreateSource {Type = GifSourceType.GIF, Data = base64String}}
            };

            using (HttpResponseMessage response = await Api.PostAsync("api/gif/create", gif))
            {
                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                Assert.Equal("image/gif", response.Content.Headers.ContentType.MediaType);
                await CustomAssert.EqualFile(@".\TestFiles\result.gif", response.Content);
            }
        }

        [Fact]
        public async void CreateGif_CallWithInvalidBase64_ReturnErrorAsync()
        {
            const string invalidBase64Image = "Not a Base64 Image";
            GifCreateBody gif = new GifCreateBody
            {
                Size = new Size(300, 300),
                Sources = new GifCreateSource[]
                {
                    new GifCreateSource {Type = GifSourceType.PNG, Data = invalidBase64Image}
                }
            };

            using (HttpResponseMessage response = await Api.PostAsync("api/gif/create", gif))
            {
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
                Assert.Equal("Data is not in base64 format", await response.Content.ReadAsStringAsync());
            }
        }

        [Fact]
        public async void CreateGif_CallWithInvalidImageData_ReturnErrorAsync()
        {
            const string invalidImageBase64String = "Tm90IGEgQmFzZTY0IEltYWdl";
            GifCreateBody gif = new GifCreateBody
            {
                Size = new Size(300, 300),
                Sources = new GifCreateSource[]
                {
                    new GifCreateSource {Type = GifSourceType.PNG, Data = invalidImageBase64String}
                }
            };

            using (HttpResponseMessage response = await Api.PostAsync("api/gif/create", gif))
            {
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
                Assert.Equal("Data could not be parsed to an image", await response.Content.ReadAsStringAsync());
            }
        }
    }
}
