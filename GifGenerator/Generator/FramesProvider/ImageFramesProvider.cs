using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using GifGenerator.Models;
using SixLabors.ImageSharp;

namespace GifGenerator.Generator.FramesProvider
{
    public class ImageFramesProvider : BaseFramesProvider
    {
        public override Task<IEnumerable<Image>> GetFrames(Stream stream, uint begin, uint count, uint step)
        {
            return Task.FromResult(LoadFrames(stream, begin, count, step));
        }

        private static IEnumerable<Image> LoadFrames(Stream stream, uint begin, uint count, uint step)
        {
            Image src;
            try
            {
                src = Image.Load(stream);
            }
            catch (Exception e)
            {
                throw new BadRequestException("Data could not be parsed to an image", e);
            }

            if (src.Frames.Count == 1) return new Image[] {src};

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
