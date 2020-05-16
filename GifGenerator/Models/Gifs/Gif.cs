using SixLabors.ImageSharp;

namespace GifGenerator.Models.Gifs
{
    public class Gif
    {
        public string AutoTag { get; set; }

        public string CustomTag { get; set; }

        public string CategoryId { get; set; }

        public Size PixelSize { get; set; }

        public long FileSize { get; set; }
    }
}