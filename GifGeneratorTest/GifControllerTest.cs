using GifGenerator.Controllers;
using GifGenerator.Models.Gifs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Newtonsoft.Json;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace GifGeneratorTest
{
    public class GifControllerTest
    {
        // this test will fail
        [Fact]
        public async void WhenCallGetGifWithWrongIdThenGetResponseCode404Async() // oder GetGif_CallWithWrongId_ReturnsResponseStatusCode404
        {
            //Arrange
            var request = new Mock<HttpRequest>();
            request.Setup(x => x.Scheme).Returns("http");
            request.Setup(x => x.Host).Returns(HostString.FromUriComponent("http://localhost:52081"));
            request.Setup(x => x.PathBase).Returns(PathString.FromUriComponent("/api"));

            var httpContext = Mock.Of<HttpContext>(_ =>
                _.Request == request.Object
            );

            //Controller needs a controller context 
            var controllerContext = new ControllerContext()
            {
                HttpContext = httpContext,
            };
            //assign context to controller
            var controller = new GifController()
            {
                ControllerContext = controllerContext,
            };
            
            var wrongId = "ThisIdIsForSureWrong!";

            //Act
            await controller.GetGif(wrongId);


            //Assert
            Assert.Equal(404, httpContext.Response.StatusCode);



            //var httpContext = new Mock<HttpContextBase>();
            //var httpResponse = new Mock<HttpResponseBase>();

            //httpContext.SetupGet(x => x.Response).Returns(this.httpResponse.Object);

            //requestContext = new RequestContext(this.httpContext.Object, new RouteData());
            //controller = new ErrorsController(this.contentRepository.Object);

            //controllerContext = new Mock<ControllerContext>(this.requestContext, this.controller);
            //controllerContext.SetupGet(x => x.HttpContext.Response).Returns(this.httpResponse.Object);
            //controller.ControllerContext = this.controllerContext.Object;

            //// Arrange
            //var gifController = new GifController();
            //var wrongId = "ThisIdIsForSureWrong!";

            //// Act
            //await gifController.GetGif(wrongId);

            //// Assert
        }



        [Fact]
        public async void CreateGif_CallWithGifCreateBody_ReturnSameGifAsync()
        {
            //Arrange
            byte[] bytes = File.ReadAllBytes(@".\Testfiles\test.gif");
            string file = Convert.ToBase64String(bytes);
            GifCreateBody gif = new GifCreateBody();
            gif.Size = new Size(300, 300);
            gif.Sources = new GifCreateSource[] { new GifCreateSource{ Type = GifSourceType.GIF, Data = file } };

            string json = JsonConvert.SerializeObject(gif);
            using (HttpContent httpContent = new StringContent(json))
            {
                using (HttpClient httpClient = new HttpClient())
                {
                    httpContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/json");
                    using (var response = await httpClient.PostAsync("http://localhost:52081/api/gif/create", httpContent))
                    {
                        // Act
                        var resultStream = await response.Content.ReadAsStreamAsync();


                        // Assert
                        byte[] expectedData = File.ReadAllBytes("result.gif");
                        Assert.Equal("image/gif", response.Content.Headers.ContentType.MediaType);
                        Assert.Equal(expectedData.Length, resultStream.Length);
                        byte[] resultData = new byte[expectedData.Length];
                        var resultLength = resultStream.Read(resultData, 0, resultData.Length);
                        Assert.Equal(expectedData.Length, resultLength);
                        Assert.Equal(expectedData, resultData);
                    }
                }
            }
        }
    }
}
