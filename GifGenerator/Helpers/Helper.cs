using SixLabors.ImageSharp;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace GifGenerator.Helpers
{
    public static class Helper
    {
        public static IEnumerable<TSource> ToNotNull<TSource>(this IEnumerable<TSource> src)
        {
            return src ?? Enumerable.Empty<TSource>();
        }

        public static MemoryStream SaveInMemoryStreamAsGif(this Image img)
        {
            MemoryStream stream = new MemoryStream();
            img.SaveAsGif(stream);
            stream.Seek(0, SeekOrigin.Begin);

            return stream;
        }
    }
}
