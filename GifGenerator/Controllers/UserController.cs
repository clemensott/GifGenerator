using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Firebase.Database.Query;
using GifGenerator.Helpers;
using GifGenerator.Models;
using GifGenerator.Models.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GifGenerator.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        [HttpPost]
        public async Task<ActionResult> CreateUser([FromBody] CreateUserBody body)
        {
            if (!UserHelper.IsValidUsername(body.Username) ||
                !UserHelper.IsPasswordValid(body.Password)) return ValidationProblem();

            bool containsUser = await FbHelper.Client.UserQuery(body.Username).ContainsKeyAsync();

            if (containsUser) return BadRequest();

            User user = new User()
            {
                Username = body.Username,
                Password = body.Password,
            };
            await FbHelper.Client.UserQuery(body.Username).PutAsync(user);

            return Ok();
        }

        [HttpPut]
        [Authorize]
        public async Task<ActionResult> EditUser([FromBody] EditUserBody body)
        {
            if (!UserHelper.IsPasswordValid(body.NewPassword)) return ValidationProblem();

            string username = User.GetUsername();

            await FbHelper.Client.UserPasswordQuery(username).PutAsync(body.NewPassword);

            return Ok();
        }

        [HttpDelete]
        [Authorize]
        public async Task<ActionResult> RemoveUser()
        {
            string token = Request.GetToken();
            string username = User.GetUsername();
            User user = await FbHelper.Client.GetUserAsync(username);

            foreach (string categoryId in user.AllCategoryIds?.Keys.ToNotNull().Concat(new[] { username }))
            {
                Category category = await FbHelper.Client.GetCategoryAsync(categoryId);

                foreach (string gifId in category?.GifIds?.Keys.ToNotNull())
                {
                    await FbHelper.Client.CategoryGifQuery(categoryId, gifId).DeleteAsync();
                }

                await FbHelper.Client.CategoryQuery(categoryId).DeleteAsync();
            }

            await FbHelper.Client.LogoutAsync(token);
            await FbHelper.Client.UserQuery(username).DeleteAsync();

            Logins allLogins = await FbHelper.Client.GetLoginsAsync();
            foreach (KeyValuePair<string, string> pair in allLogins.Where(p => p.Value == username))
            {
                await FbHelper.Client.LoginQuery(pair.Key).DeleteAsync();
            }

            return Ok();
        }
    }
}