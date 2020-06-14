using System.Collections.Generic;

namespace GifGeneratorTest.Models
{
    public class Storage
    {
        public IDictionary<string, string> Gif { get; set; } = new Dictionary<string, string>();

        public static Storage Create(params (string gifId, string filePath)[] gifs)
        {
            Storage storage = new Storage();

            foreach ((string gifId, string filePath) in gifs)
            {
                storage.Gif.Add(gifId + ".gif", filePath);
            }

            return storage;
        }
    }
}
