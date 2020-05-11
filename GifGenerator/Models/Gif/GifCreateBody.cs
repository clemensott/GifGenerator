using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace GifGenerator.Models.Gif
{
    public class GifCreateBody
    {
        [Required]
        [MinLength(1)]
        public GifCreateSource[] Sources { get; set; }
    }
}
