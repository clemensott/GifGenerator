using System.IO;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Xunit;

namespace GifGeneratorTest.Helpers
{
    public static class CustomAssert
    {
        public static async Task EqualFile(string expectedFilePath, HttpContent actualContent)
        {
            Stream actualStream = await actualContent.ReadAsStreamAsync();
            byte[] expectedData = await File.ReadAllBytesAsync(expectedFilePath);
            byte[] resultData = new byte[expectedData.Length];
            int resultLength = await actualStream.ReadAsync(resultData, 0, resultData.Length);

            Assert.Equal(expectedData.Length, resultLength);
            Assert.Equal(expectedData, resultData);
        }

        public static async Task EqualJson(string expectedFilePath, HttpContent actualContent)
        {
            string expectedText = await File.ReadAllTextAsync(expectedFilePath);
            JToken expectedJson = (JToken)JsonConvert.DeserializeObject(expectedText);
            JToken actualJson = await actualContent.ReadAsJsonAsync();

            Assert.True(JToken.DeepEquals(expectedJson, actualJson));
        }
    }
}
