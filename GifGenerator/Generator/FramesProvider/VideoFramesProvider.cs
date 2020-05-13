using System;
using System.Collections.Generic;
using System.IO;
using SixLabors.ImageSharp;

namespace GifGenerator.Generator.FramesProvider
{
    public class VideoFramesProvider : BaseFramesProvider
    {
        public override IEnumerable<Image> GetFrames(Stream stream, uint begin, uint count, uint step)
        {
            /// TODO: Implement extracting frames from video
            throw new NotImplementedException();
        }
    }
}
