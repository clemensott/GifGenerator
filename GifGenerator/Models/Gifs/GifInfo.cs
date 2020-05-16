namespace GifGenerator.Models.Gifs
{
    public class GifInfo : Gif
    {
        public string Id { get; set; }

        public GifInfo(string id, Gif gif)
        {
            Id = id;
            AutoTag = gif.AutoTag;
            CustomTag = gif.CustomTag;
            CategoryId = gif.CategoryId;
            PixelSize = gif.PixelSize;
            FileSize = gif.FileSize;
        }
    }
}