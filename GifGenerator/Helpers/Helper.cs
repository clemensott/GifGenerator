using System.Collections.Generic;
using System.Linq;

namespace GifGenerator.Helpers
{
    public static class Helper
    {
        public static IEnumerable<TSource> ToNotNull<TSource>(this IEnumerable<TSource> src)
        {
            return src ?? Enumerable.Empty<TSource>();
        }
    }
}
