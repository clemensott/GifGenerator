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
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace GifGeneratorTest
{
    public class GifControllerTest
    {
        [Fact]
        public async void CreateGif_CallWithGifCreateBody_ReturnSameGifAsync()
        {
            //Arrange
            byte[] bytes = await File.ReadAllBytesAsync(@".\Testfiles\test.gif");
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
                    using (HttpResponseMessage response = await httpClient.PostAsync("http://localhost:52081/api/gif/create", httpContent))
                    {
                        // Act
                        Stream resultStream = await response.Content.ReadAsStreamAsync();
                        
                        // Assert
                        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                        Assert.Equal("image/gif", response.Content.Headers.ContentType.MediaType);
                        byte[] expectedData = await File.ReadAllBytesAsync(@".\Testfiles\result.gif");
                        Assert.Equal(expectedData.Length, resultStream.Length);
                        byte[] resultData = new byte[expectedData.Length];
                        int resultLength = await resultStream.ReadAsync(resultData, 0, resultData.Length);
                        Assert.Equal(expectedData.Length, resultLength);
                        Assert.Equal(expectedData, resultData);
                    }
                }
            }
        }
   
        [Fact]
        public async void CreateGif_CallWithInvalidGifCreateBody_ReturnErrorAsync()
        {
            //Arrange
            const string file = "Not a Base64 Image";
            GifCreateBody gif = new GifCreateBody();
            gif.Size = new Size(300, 300);
            gif.Sources = new GifCreateSource[] { new GifCreateSource{ Type = GifSourceType.PNG, Data = file } };

            string json = JsonConvert.SerializeObject(gif);
            using (HttpContent httpContent = new StringContent(json))
            {
                using (HttpClient httpClient = new HttpClient())
                {
                    httpContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/json");
                    using (HttpResponseMessage response = await httpClient.PostAsync("http://localhost:52081/api/gif/create", httpContent))
                    {
                        // Act
                        Stream resultStream = await response.Content.ReadAsStreamAsync();


                        // Assert
                        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
                    }
                }
            }
        }
    }
}
