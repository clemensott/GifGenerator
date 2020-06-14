using SixLabors.ImageSharp;

namespace GifGeneratorTest.Models
{
    public class DbGif
    {
        public string Id { get; set; }

        public string AutoTag { get; set; }

        public string CustomTag { get; set; }

        public Size PixelPixelSize { get; set; }

        public long FileSize { get; set; }

        public DbGif(string id, long fileSize = 0, int width = 0,
            int height = 0, string autoTag = default(string), string customTag = default(string))
            : this(id, fileSize, new Size(width, height), autoTag, customTag) { }

        public DbGif(string id, long fileSize = 0, Size pixelSize = default(Size), string autoTag = default(string),
            string customTag = default(string))
        {
            Id = id;
            AutoTag = autoTag;
            CustomTag = customTag;
            PixelPixelSize = pixelSize;
            FileSize = fileSize;
        }
    }
}
