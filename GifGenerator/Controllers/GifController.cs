using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Firebase.Database.Query;
using GifGenerator.Generator;
using GifGenerator.Helpers;
using GifGenerator.Models.Gifs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Gif;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;

namespace GifGenerator.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class GifController : ControllerBase
    {
        [HttpPost("create")]
        public async Task CreateGif([FromBody] GifCreateBody body)
        {
            using (Image gif = await GifsGenerator.Create(body))
            {
                Response.ContentType = "image/gif";
                gif.SaveAsGif(Response.Body);
            }
        }

        [HttpGet("{gifId}/meta")]
        public async Task<ActionResult<Gif>> GetMeta(string gifId)
        {
            Gif meta = await FbHelper.Client.GetGif(gifId);
            bool hasCategory = await FbHelper.Client.UserContainsCategory(User.GetUsername(), meta.CategoryId);

            if (hasCategory) return meta;

            return NotFound();
        }

        [HttpDelete("{gifId}")]
        public async Task<ActionResult> DeleteGif(string gifId)
        {
            Gif meta = await FbHelper.Client.GetGif(gifId);
            bool hasCategory = await FbHelper.Client.UserContainsCategory(User.GetUsername(), meta.CategoryId);

            if (!hasCategory) return NotFound();

            await FbHelper.Client.CategoryChildQuery(meta.CategoryId, gifId).DeleteAsync();
            await FbHelper.Client.GifQuery(gifId).DeleteAsync();

            return Ok();
        }
    }
}