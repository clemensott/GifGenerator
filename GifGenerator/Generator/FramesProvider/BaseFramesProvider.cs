using GifGenerator.Models.Gifs;
using SixLabors.ImageSharp;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace GifGenerator.Generator.FramesProvider
{
    public abstract class BaseFramesProvider
    {
        public abstract IEnumerable<Image> GetFrames(Stream stream, uint begin, uint count, uint step);

        protected static IEnumerable<Image> FilterFrames(IEnumerable<Image> frames, uint begin, uint count, uint step)
        {
            int index = 0;
            foreach (Image frame in frames.Skip((int)begin))
            {
                if (index % step == 0) yield return frame;
                if (index >= count * step) break;

                index++;
            }
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
