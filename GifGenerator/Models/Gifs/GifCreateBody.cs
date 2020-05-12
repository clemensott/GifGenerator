using System.ComponentModel.DataAnnotations;

namespace GifGenerator.Models.Gifs
{
    public class GifCreateBody
    {
        [Required]
        [MinLength(1)]
        public GifCreateSource[] Sources { get; set; }
    }
}
