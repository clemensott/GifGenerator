using System.Collections.Generic;
using System.IO;
using System.Linq;
using SixLabors.ImageSharp;

namespace GifGenerator.Generator.FramesProvider
{
    public class ImageFramesProvider : BaseFramesProvider
    {
        public override IEnumerable<Image> GetFrames(Stream stream, uint begin, uint count, uint step)
        {
            Image src = Image.Load(stream);

            if (src.Frames.Count == 1) return new Image[] { src };

            try
            {
                IEnumerable<Image> frames = src.Frames.Select((f, i) => src.Frames.CloneFrame(i));
                return FilterFrames(frames, begin, count, step).ToArray();
            }
            finally
            {
                src.Dispose();
            }
        }
    }
}
