using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Firebase.Database.Query;
using GifGenerator.Generator;
using GifGenerator.Helpers;
using GifGenerator.Models;
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
        public async Task<ActionResult> GetGif(string gifId)
        {
            if (!FbDbHelper.IsValidKey(gifId)) return BadRequest();

            Gif meta = await FbDbHelper.Client.GetGifAsync(gifId);
            if (meta == null) return NotFound();


            string username = User.GetUsername();
            if (meta.CategoryId != username)
            {
                bool hasCategory = await FbDbHelper.Client.UserContainsCategoryAsync(username, meta.CategoryId);
                if (!hasCategory) return NotFound();
            }

            Stream gifStream = await FbSgHelper.Client.GetGifStreamAsync(gifId);
            return File(gifStream, "image/gif");
        }

        [HttpGet("{gifId}/url")]
        public async Task<ActionResult<string>> GetGifUrl(string gifId)
        {
            if (!FbDbHelper.IsValidKey(gifId)) return BadRequest();

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
        [AllowAnonymous]
        [DisableRequestSizeLimit]
        public async Task CreateGif([FromBody] GifCreateBody body)
        {
            try
            {
                using (Image gif = await GifsGenerator.Create(body))
                {
                    Response.ContentType = "image/gif";
                    gif.SaveAsGif(Response.Body);
                }
            }
            catch (BadRequestException e)
            {
                Response.StatusCode = 400;
                Response.ContentType = "text/plain";

                byte[] bytes = Encoding.UTF8.GetBytes(e.Message);
                await Response.Body.WriteAsync(bytes, 0, bytes.Length);
            }
        }

        [HttpPost("create/add/{categoryId}")]
        [DisableRequestSizeLimit]
        public async Task<ActionResult<string>> CreateAdd(string categoryId, [FromBody] GifCreateBody body)
        {
            if (!FbDbHelper.IsValidKey(categoryId)) return BadRequest();

            string gifId;
            string username = User.GetUsername();

            bool hasCategory = await FbDbHelper.Client.UserContainsCategoryAsync(username, categoryId);
            if (!hasCategory) return NotFound();

            try
            {
                using (Image gif = await GifsGenerator.Create(body))
                {
                    using (Stream stream = gif.SaveInMemoryStreamAsGif())
                    {
                        Gif meta = new Gif()
                        {
                            CategoryId = categoryId,
                            PixelSize = gif.Size,
                            FileSize = stream.Length
                        };
                        gifId = await FbDbHelper.Client.AddGifAsync(meta);
                        await FbSgHelper.Client.PutGifAsync(gifId, stream);
                    }
                }
            }
            catch (BadRequestException e)
            {
                return BadRequest(e.Message);
            }

            await FbDbHelper.Client.CategoryGifQuery(categoryId, gifId).PutAsync();

            return gifId;
        }

        [HttpPost("add/{categoryId}")]
        [DisableRequestSizeLimit]
        public async Task<ActionResult<GifInfo>> UploadGif(string categoryId, [FromBody] string base64)
        {
            Size? gifSize;
            byte[]? data = Convert.FromBase64String(base64);

            try
            {
                using (Image gif = Image.Load(new ReadOnlySpan<byte>(data)))
                {
                    gifSize = gif.Size;
                }
            }
            catch
            {
                gifSize = null;
            }

            if (!gifSize.HasValue) return BadRequest("Data is not a GIF");

            Gif meta = new Gif()
            {
                CategoryId = categoryId,
                PixelSize = gifSize.Value,
                FileSize = data.Length
            };
            string gifId = await FbDbHelper.Client.AddGifAsync(meta);

            using (MemoryStream stream = new MemoryStream(data))
            {
                await FbSgHelper.Client.PutGifAsync(gifId, stream);
            }

            await FbDbHelper.Client.CategoryGifQuery(categoryId, gifId).PutAsync();

            return new GifInfo(gifId, meta);
        }

        [HttpGet("{gifId}/meta")]
        public async Task<ActionResult<GifInfo>> GetMeta(string gifId)
        {
            if (!FbDbHelper.IsValidKey(gifId)) return BadRequest();

            Gif meta = await FbDbHelper.Client.GetGifAsync(gifId);
            if (meta == null) return NotFound();

            string username = User.GetUsername();
            bool isBaseCategory = meta.CategoryId == username;
            if (!isBaseCategory)
            {
                bool hasCategory = await FbDbHelper.Client.UserContainsCategoryAsync(username, meta.CategoryId);

                if (!hasCategory) return NotFound();
            }

            meta.CategoryId = isBaseCategory ? string.Empty : meta.CategoryId;
            return new GifInfo(gifId, meta);
        }

        [HttpPut("{gifId}/customtag")]
        public async Task<ActionResult> SetCustomTag(string gifId, [FromBody] string newCustomTag)
        {
            if (!FbDbHelper.IsValidKey(gifId)) return BadRequest();

            Gif meta = await FbDbHelper.Client.GetGifAsync(gifId);
            if (meta == null) return NotFound();

            bool hasCategory = await FbDbHelper.Client.UserContainsCategoryAsync(User.GetUsername(), meta.CategoryId);
            if (!hasCategory) return NotFound();

            if (string.IsNullOrWhiteSpace(newCustomTag)) await FbDbHelper.Client.GifCustomTagQuery(gifId).DeleteAsync();
            else await FbDbHelper.Client.GifCustomTagQuery(gifId).PutAsync<string>(newCustomTag);

            return Ok();
        }

        [HttpPut("{gifId}/move/{destCategoryId}")]
        public async Task<ActionResult> MoveGif(string gifId, string destCategoryId)
        {
            if (!FbDbHelper.IsValidKey(gifId)) return BadRequest();
            if (!FbDbHelper.IsValidKey(destCategoryId)) return BadRequest();

            string username = User.GetUsername();
            Gif meta = await FbDbHelper.Client.GetGifAsync(gifId);

            bool hasSrcCategory = await FbDbHelper.Client.UserContainsCategoryAsync(username, meta.CategoryId);
            if (!hasSrcCategory) return NotFound();

            bool hasDestCategory = await FbDbHelper.Client.UserContainsCategoryAsync(username, destCategoryId);
            if (!hasDestCategory) return NotFound();

            await FbDbHelper.Client.CategoryGifQuery(meta.CategoryId, gifId).DeleteAsync();
            await FbDbHelper.Client.GifCategroyQuery(gifId).PutAsync<string>(destCategoryId);
            await FbDbHelper.Client.CategoryGifQuery(destCategoryId, gifId).PutAsync();

            return Ok();
        }

        [HttpDelete("{gifId}")]
        public async Task<ActionResult> DeleteGif(string gifId)
        {
            if (!FbDbHelper.IsValidKey(gifId)) return BadRequest();

            Gif meta = await FbDbHelper.Client.GetGifAsync(gifId);
            bool hasCategory = await FbDbHelper.Client.UserContainsCategoryAsync(User.GetUsername(), meta.CategoryId);

            if (!hasCategory) return NotFound();

            await FbDbHelper.Client.CategoryGifQuery(meta.CategoryId, gifId).DeleteAsync();
            await FbDbHelper.Client.GifQuery(gifId).DeleteAsync();

            return Ok();
        }
    }
}
