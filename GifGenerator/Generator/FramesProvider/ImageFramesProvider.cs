using System;
using System.IO;
using System.Threading.Tasks;
using GifGenerator.Models;
using GifGenerator.Models.Gifs;
using SixLabors.ImageSharp;

namespace GifGenerator.Generator.FramesProvider
{
    public class ImageFramesProvider : BaseFramesProvider
    {
        public override Task<Image> GetFrames(string filePath, GifCreateSource src)
        {
            using (FileStream stream = File.OpenRead(filePath))
            {
                return Task.FromResult(LoadFrames(stream, src));
            }
        }

        private static Image LoadFrames(Stream stream, GifCreateSource props)
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

            GifCreateSourceGifFrameSelection selection = props.GifFrameSelection;
            return selection == null
                ? src
                : FilterFrame(src, selection.Begin, selection.Count, selection.Step);
        }
    }
}
