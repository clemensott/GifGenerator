using System.IO;
using System.Threading.Tasks;
using Firebase.Database.Query;
using GifGenerator.Generator;
using GifGenerator.Helpers;
using GifGenerator.Models.Gifs;
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
        [HttpGet("{gifId}")]
        public async Task GetGif(string gifId)
        {
            Gif meta = await FbDbHelper.Client.GetGifAsync(gifId);
            if (meta == null)
            {
                Response.StatusCode = 404;
                return;
            }

            string username = User.GetUsername();
            if (meta.CategoryId != username)
            {
                bool hasCategory = await FbDbHelper.Client.UserContainsCategoryAsync(username, meta.CategoryId);
                if (!hasCategory)
                {
                    Response.StatusCode = 404;
                    return;
                }
            }

            Stream gifStream = await FbSgHelper.Client.GetGifStreamAsync(gifId);
            await gifStream.CopyToAsync(Response.Body);
        }

        [HttpGet("{gifId}/url")]
        public async Task<ActionResult<string>> GetGifUrl(string gifId)
        {
            Gif meta = await FbDbHelper.Client.GetGifAsync(gifId);
            if (meta == null) return NotFound();

            string username = User.GetUsername();
            if (meta.CategoryId != username)
            {
                bool hasCategory = await FbDbHelper.Client.UserContainsCategoryAsync(username, meta.CategoryId);
                if (!hasCategory) return NotFound();
            }

            return await FbSgHelper.Client.GetGifDownloadUrlAsync(gifId);
        }

        [HttpPost("create")]
        public async Task CreateGif([FromBody] GifCreateBody body)
        {
            using (Image gif = await GifsGenerator.Create(body))
            {
                Response.ContentType = "image/gif";
                gif.SaveAsGif(Response.Body);
            }
        }

        [HttpPost("create/add")]
        public Task<ActionResult<string>> CreateAdd([FromBody] GifCreateBody body)
        {
            string username = User.GetUsername();
            return CreateAdd(body, username, username, false);
        }

        [HttpPost("create/add/{categoryId}")]
        public Task<ActionResult<string>> CreateAdd(string categoryId, [FromBody] GifCreateBody body)
        {
            string username = User.GetUsername();
            return CreateAdd(body, categoryId, username, true);
        }

        public async Task<ActionResult<string>> CreateAdd(GifCreateBody body, string categoryId, string username, bool checkCategoryId)
        {
            string gifId, gifUrl;

            if (checkCategoryId)
            {
                bool hasCategory = await FbDbHelper.Client.UserContainsCategoryAsync(username, categoryId);
                if (!hasCategory) return NotFound();
            }

            using (Image gif = await GifsGenerator.Create(body))
            {
                gifId = await FbDbHelper.Client.AddGifAsync(new Gif() { CategoryId = categoryId, });
                gifUrl = await FbSgHelper.Client.PutGifAsync(gifId, gif.SaveInMemoryStreamAsGif());
            }

            await FbDbHelper.Client.CategoryGifQuery(categoryId, gifId).PutAsync();

            return gifId;
        }

        [HttpGet("{gifId}/meta")]
        public async Task<ActionResult<Gif>> GetMeta(string gifId)
        {
            Gif meta = await FbDbHelper.Client.GetGifAsync(gifId);
            if (meta == null) return NotFound();

            string username = User.GetUsername();
            if (meta.CategoryId != username)
            {
                bool hasCategory = await FbDbHelper.Client.UserContainsCategoryAsync(username, meta.CategoryId);

                if (!hasCategory) return NotFound();
            }

            return meta;
        }

        [HttpPut("{gifId}/customtag")]
        public async Task<ActionResult> SetCustomTag(string gifId, [FromBody] string newCustomTag)
        {
            Gif meta = await FbDbHelper.Client.GetGifAsync(gifId);
            if (meta == null) return NotFound();

            bool hasCategory = await FbDbHelper.Client.UserContainsCategoryAsync(User.GetUsername(), meta.CategoryId);
            if (!hasCategory) return NotFound();

            if (string.IsNullOrWhiteSpace(newCustomTag)) await FbDbHelper.Client.GifCustomTagQuery(gifId).DeleteAsync();
            else await FbDbHelper.Client.GifCustomTagQuery(gifId).PutAsync<string>(newCustomTag);

            return Ok();
        }

        [HttpPut("{gifId}/move")]
        public Task<ActionResult> MoveGif(string gifId)
        {
            string username = User.GetUsername();
            return MoveGif(gifId, username, username, true);
        }

        [HttpPut("{gifId}/move/{categoryId}")]
        public Task<ActionResult> MoveGif(string gifId, string destCategoryId)
        {
            return MoveGif(gifId, destCategoryId, User.GetUsername(), true);
        }

        public async Task<ActionResult> MoveGif(string gifId, string destCategoryId, string username, bool checkDestCategoryId)
        {
            Gif meta = await FbDbHelper.Client.GetGifAsync(gifId);
            bool hasSrcCategory = await FbDbHelper.Client.UserContainsCategoryAsync(username, meta.CategoryId);
            if (!hasSrcCategory) return NotFound();

            if (checkDestCategoryId)
            {
                bool hasDestCategory = await FbDbHelper.Client.UserContainsCategoryAsync(username, destCategoryId);
                if (!hasDestCategory) return NotFound();
            }

            await FbDbHelper.Client.CategoryGifQuery(meta.CategoryId, gifId).DeleteAsync();
            await FbDbHelper.Client.GifCategroyQuery(gifId).PutAsync<string>(destCategoryId);
            await FbDbHelper.Client.CategoryGifQuery(destCategoryId, gifId).PutAsync();

            return Ok();
        }

        [HttpDelete("{gifId}")]
        public async Task<ActionResult> DeleteGif(string gifId)
        {
            Gif meta = await FbDbHelper.Client.GetGifAsync(gifId);
            bool hasCategory = await FbDbHelper.Client.UserContainsCategoryAsync(User.GetUsername(), meta.CategoryId);

            if (!hasCategory) return NotFound();

            await FbDbHelper.Client.DeleteCategoryChildAsync(meta.CategoryId, gifId);
            await FbDbHelper.Client.GifQuery(gifId).DeleteAsync();

            return Ok();
        }
    }
}