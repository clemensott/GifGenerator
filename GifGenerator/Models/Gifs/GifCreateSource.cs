using SixLabors.ImageSharp;
using System.ComponentModel.DataAnnotations;

namespace GifGenerator.Models.Gifs
{
    public class GifCreateSource
    {
        /// <summary>
        /// Get or sets the Type of data.
        /// </summary>
        [Required]
        public GifSourceType Type { get; set; }

        /// <summary>
        /// Get or sets the Data in Base64 format.
        /// </summary>
        public string Data { get; set; }

        /// <summary>
        /// Get or sets the url which is used the get the data. Gets ignored if Data is given.
        /// </summary>
        public string Url { get; set; }

        /// <summary>
        /// Get or sets the HttpRequestMessage which is used to fetch the data. Gets ignored if Url is given.
        /// </summary>
        public CustomSourceRequest CustomRequest { get; set; }

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

        /// <summary>
        /// Get or sets the area which will be used of the frames.
        /// </summary>
        public Rectangle? CropRect { get; set; }

        /// <summary>
        /// Gets or sets the frame delay in number of hundredths (1/100) of a second. Defaults to 0.
        /// </summary>
        public uint FrameDelay { get; set; }
    }
}
