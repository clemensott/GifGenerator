using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GifGenerator.Models.Gifs
{
    public class CustomSourceRequest
    {
        public string Url { get; set; }

        public string Method { get; set; }

        /// <summary>
        /// Get or sets the content of the request in Base64 format
        /// </summary>
        public string Content { get; set; }

        public Dictionary<string, string> Headers { get; set; }
    }
}
