using System.ComponentModel.DataAnnotations;

namespace GifGenerator.Models.Gifs
{
    public class GifCreateSourceVideoFrameSelection
    {
        /// <summary>
        /// Get or sets the beginning of the extracted part of the video in milliseconds. Defaults to 0.
        /// </summary>
        [Range(0, double.MaxValue)]
        public double BeginSeconds { get; set; } = 0;

        /// <summary>
        /// Get or sets the duration of the extracted part of the video in milliseconds. Defaults to end of video.
        /// </summary>
        [Range(0, double.MaxValue)]
        public double? DurationSeconds { get; set; }

        /// <summary>
        /// Get or sets the frame rate of the extracted part of the video in frames per seconds. Defaults to frame rate of video.
        /// </summary>
        [Range(0, double.MaxValue)]
        public double? FrameRate { get; set; }
    }
}
