using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Firebase.Database.Query;
using GifGenerator.Helpers;
using GifGenerator.Models.Categories;
using GifGenerator.Models.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GifGenerator.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        [HttpGet]
        [Authorize]
        public ActionResult<UserInfo> GetUser()
        {
            return new UserInfo() {Username = User.GetUsername()};
        }

        [HttpPost]
        public async Task<ActionResult> CreateUser([FromBody] CreateUserBody body)
        {
            if (!UserHelper.IsValidUsername(body.Username))return BadRequest("Username is not valid.");
            if (!UserHelper.IsPasswordValid(body.Password)) return BadRequest("Password is not valid.");

            bool containsUser = await FbDbHelper.Client.UserQuery(body.Username).ContainsKeyAsync();

            if (containsUser) return BadRequest("User already exists");

            User user = new User()
            {
                Password = body.Password,
            };
            await FbDbHelper.Client.UserQuery(body.Username).PutAsync(user);

            return Ok();
        }

        [HttpPut]
        [Authorize]
        public async Task<ActionResult> EditUser([FromBody] EditUserBody body)
        {
            if (!UserHelper.IsPasswordValid(body.NewPassword)) return ValidationProblem();

            string username = User.GetUsername();

            await FbDbHelper.Client.UserPasswordQuery(username).PutAsync(body.NewPassword);

            return Ok();
        }

        [HttpDelete]
        [Authorize]
        public async Task<ActionResult> RemoveUser()
        {
            string token = Request.GetToken();
            string username = User.GetUsername();
            User user = await FbDbHelper.Client.GetUserAsync(username);

            foreach (string categoryId in user.AllCategoryIds?.Keys.ToNotNull().Concat(new[] {username}))
            {
                Category category = await FbDbHelper.Client.GetCategoryAsync(categoryId);

                foreach (string gifId in category?.GifIds?.Keys.ToNotNull())
                {
                    await FbDbHelper.Client.CategoryGifQuery(categoryId, gifId).DeleteAsync();
                }

                await FbDbHelper.Client.CategoryQuery(categoryId).DeleteAsync();
            }

            await FbDbHelper.Client.LogoutAsync(token);
            await FbDbHelper.Client.UserQuery(username).DeleteAsync();

            Logins allLogins = await FbDbHelper.Client.GetLoginsAsync();
            foreach (KeyValuePair<string, string> pair in allLogins.Where(p => p.Value == username))
            {
                await FbDbHelper.Client.LoginQuery(pair.Key).DeleteAsync();
            }

            return Ok();
        }
    }
}