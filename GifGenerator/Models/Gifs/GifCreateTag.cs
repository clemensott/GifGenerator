using System.ComponentModel.DataAnnotations;
using SixLabors.Fonts;

namespace GifGenerator.Models.Gifs
{
    public class GifCreateTag
    {
        [Required] public string Text { get; set; }

        public VerticalAlignment Position { get; set; } = VerticalAlignment.Bottom;

        /// <summary>
        /// Get or sets the max height of the tag. It is a factor from 0 to 1 relative to the height of the gif. Defaults to 25% (0.25).  
        /// </summary>
        [Range(0f, 1f)]
        public float MaxHeight { get; set; } = 0.25f;
    }
}
