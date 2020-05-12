using System.ComponentModel.DataAnnotations;

namespace GifGenerator.Models.Gifs
{
    public class GifCreateSource
    {
        /// <summary>
        /// The Type of data
        /// </summary>
        [Required]
        public GifSourceType Type { get; set; }

        /// <summary>
        /// The Data in Base64 format
        /// </summary>
        [Required]
        public string Data { get; set; }

        /// <summary>
        /// The index of the begin frame. If not given it will be the first frame
        /// </summary>
        public int Begin { get; set; } = 0;

        /// <summary>
        /// The count of frame that will be taken. If not given all remaining frames will be taken
        /// </summary>
        public int Count { get; set; } = int.MaxValue;
    }
}
