using GifGenerator.Models.Gifs;
using SixLabors.ImageSharp;
using System;
using System.IO;
using System.Threading.Tasks;

namespace GifGenerator.Generator.FramesProvider
{
    public abstract class BaseFramesProvider
    {
        public abstract Task<Image> GetFrames(Stream stream, GifCreateSource src);

        protected static Image FilterFrame(Image image, uint begin, uint count, uint step)
        {
            for (int i = 0; i < begin; i++)
            {
                image.Frames.RemoveFrame(0);
            }

            int end = (int)Math.Min(count * step, image.Frames.Count);
            for (int i = end - 1; i >= 0; i--)
            {
                if (i % step != 0) image.Frames.RemoveFrame(i);
            }

            for (int i = end; i < image.Frames.Count; i++)
            {
                image.Frames.RemoveFrame(end);
            }

            return image;
        }

        public static BaseFramesProvider GetFramesProvider(GifSourceType type)
        {
            switch (type)
            {
                case GifSourceType.GIF:
                case GifSourceType.JPEG:
                case GifSourceType.PNG:
                case GifSourceType.BMP:
                    return new ImageFramesProvider();

                case GifSourceType.MP4:
                    return new VideoFramesProvider();
            }

            throw new ArgumentException("Type is not supported: " + type, nameof(type));
        }
    }
}
