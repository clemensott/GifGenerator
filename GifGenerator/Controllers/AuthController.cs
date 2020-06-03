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
        private static readonly TimeSpan minCookieAge = TimeSpan.FromHours(1), maxCookieAge = TimeSpan.FromDays(300);

        [HttpPost("login")]
        public async Task<ActionResult<LoginInfo>> LoginUser([FromBody] LoginBody body)
        {
            string password = await FbDbHelper.Client.GetUserPasswordAsync(body.Username);

            if (password == null || password != body.Password) return BadRequest();

            Login login = new Login()
            {
                Username = body.Username,
                Expires = DateTimeOffset.Now.Add(body.KeepLoggedIn ? maxCookieAge : minCookieAge),
            };
            string token = await FbDbHelper.Client.LoginAsync(login);

            Response.Cookies.Append(UserHelper.CookieName, token, new CookieOptions()
            {
                Path = "/",
                Expires = login.Expires,
            });

            return new LoginInfo(token, login.Expires);
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<ActionResult> LogoutUser()
        {
            string token = Request.GetToken();

            await FbDbHelper.Client.LogoutAsync(token);

            Response.Cookies.Delete(UserHelper.CookieName);
            return Ok();
        }
    }
}