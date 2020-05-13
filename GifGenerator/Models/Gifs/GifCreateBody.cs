using SixLabors.ImageSharp;
using System.ComponentModel.DataAnnotations;

namespace GifGenerator.Models.Gifs
{
    public class GifCreateBody
    {
        [Required]
        [MinLength(1)]
        public GifCreateSource[] Sources { get; set; }

        /// <summary>
        /// Get or sets the size the created GIF will be resized to. This can change the aspect ratio.
        /// </summary>
        public Size Size { get; set; }

        /// <summary>
        /// Gets or sets the number of times any animation is repeated. 0 means to repeat indefinitely, count is set as repeat n-1 times. Defaults to MaxValue.
        /// </summary>
        public ushort RepeatCount { get; set; } = ushort.MaxValue;
    }
}
