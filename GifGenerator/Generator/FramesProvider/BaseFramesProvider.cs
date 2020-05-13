using SixLabors.ImageSharp;
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
    }
}
