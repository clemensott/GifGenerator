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
        public override async Task<Image> GetFrames(Stream stream, GifCreateSource src)
        {
            using (MemoryStream ms = new MemoryStream())
            {
                await stream.CopyToAsync(ms);
                ms.Seek(0, SeekOrigin.Begin);
                return LoadFrames(ms, src);
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
