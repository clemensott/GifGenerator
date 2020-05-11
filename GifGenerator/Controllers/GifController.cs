using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GifGenerator.Models.Gif;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SixLabors.ImageSharp;

namespace GifGenerator.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class GifController : ControllerBase
    {
        [HttpPost("create")]
        public ActionResult CreateGif([FromBody] GifCreateBody body)
        {
            return Ok();
        }
    }
}