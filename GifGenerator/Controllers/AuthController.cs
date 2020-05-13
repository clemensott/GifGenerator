using System;
using System.Threading.Tasks;
using GifGenerator.Helpers;
using GifGenerator.Models.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GifGenerator.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private static readonly TimeSpan maxCookieAge = TimeSpan.FromHours(1);

        [HttpPost("login")]
        public async Task<ActionResult<string>> LoginUser([FromBody] LoginBody body)
        {
            string password = await FbHelper.Client.GetUserPasswordAsync(body.Username);

            if (password == null || password != body.Password) return BadRequest();

            string token = await FbHelper.Client.LoginAsync(body.Username);

            Response.Cookies.Append(UserHelper.CookieName, token, new CookieOptions()
            {
                HttpOnly = true,
                Secure = true,
                MaxAge = body.KeepLoggedIn ? (TimeSpan?)null : maxCookieAge
            });

            return token;
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<ActionResult> LogoutUser()
        {
            string token = Request.GetToken();

            await FbHelper.Client.LogoutAsync(token);

            Response.Cookies.Delete(UserHelper.CookieName);
            return Ok();
        }
    }
}