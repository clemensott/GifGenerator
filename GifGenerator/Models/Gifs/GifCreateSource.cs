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
        /// Get or sets the object which defines the selected frames of the source gif that are used to generated the result gif.
        /// </summary>
        public GifCreateSourceGifFrameSelection GifFrameSelection { get; set; }

        /// <summary>
        /// Get or sets the object which defines the extracted part of the source video that are used to generated the result gif.
        /// </summary>
        public GifCreateSourceVideoFrameSelection VideoFrameSelection { get; set; }

        /// <summary>
        /// Get or sets the area which will be used of the frames.
        /// </summary>
        public Rectangle? CropRect { get; set; }

        /// <summary>
        /// Gets or sets the frame delay in number of hundredths (1/100) of a second. Defaults to frame delay of src or 0.
        /// </summary>
        [Range(0, int.MaxValue)]
        public int? FrameDelay { get; set; }
    }
}
