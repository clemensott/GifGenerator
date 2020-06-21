using System.ComponentModel.DataAnnotations;

namespace GifGenerator.Models.Gifs
{
    public class GifCreateSourceGifFrameSelection
    {
        /// <summary>
        /// Get or sets the index of the begin frame. Defaults to 0.
        /// </summary>
        public uint Begin { get; set; } = 0;

        /// <summary>
        /// Get or sets the count of frame that will be taken. Defaults to MaxValue.
        /// </summary>
        [Range(1, uint.MaxValue)]
        public uint Count { get; set; } = uint.MaxValue;

        /// <summary>
        /// Get or sets the step size, which can be used to skip frames from the data. Defaults to 1.
        /// </summary>
        [Range(1, uint.MaxValue)]
        public uint Step { get; set; } = 1;
    }
}
