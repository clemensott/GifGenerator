using System.Collections.Generic;
using System.Threading.Tasks;
using Firebase.Database;
using Firebase.Database.Query;
using GifGenerator.Helpers;
using GifGenerator.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GifGenerator.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CategoryController : ControllerBase
    {
        [HttpGet]
        [Authorize]
        public Task<ActionResult<Category>> GetCategory()
        {
            return GetCategory(User.GetUsername(), null);
        }

        [HttpGet("{categoryId}")]
        [Authorize]
        public Task<ActionResult<Category>> GetCategory(string categoryId)
        {
            return GetCategory(categoryId, User.GetUsername());
        }

        private async Task<ActionResult<Category>> GetCategory(string categoryId, string username)
        {
            if (!string.IsNullOrWhiteSpace(username))
            {
                bool hasCategory = await FbHelper.Client.UserContainsCategoryAsync(username, categoryId);

                if (!hasCategory) return NotFound();
            }

            Category category = await FbHelper.Client.GetCategoryAsync(categoryId);

            return category ?? new Category();
        }

        [HttpPost("create")]
        [Authorize]
        public Task<ActionResult<string>> CreateCategory([FromBody] string name)
        {
            string username = User.GetUsername();
            return CreateCategory(name, username, username, false);
        }

        [HttpPost("{categoryId}/create")]
        [Authorize]
        public Task<ActionResult<string>> CreateCategory(string categoryId, [FromBody] string name)
        {
            string username = User.GetUsername();
            return CreateCategory(name, categoryId, username, true);
        }

        private async Task<ActionResult<string>> CreateCategory(string name, string parentId, string username, bool checkParentId)
        {
            if (checkParentId)
            {
                bool hasParentId = await FbHelper.Client.UserContainsCategoryAsync(username, parentId);
                if (!hasParentId) return NotFound();
            }

            Category category = new Category()
            {
                Name = name,
                ParentId = parentId,
            };

            FirebaseObject<Category> addedCategory = await FbHelper.Client.CategoriesQuery().PostAsync(category);
            string categoryId = addedCategory.Key;

            await FbHelper.Client.PutCategoryChildAsync(parentId, categoryId);
            await FbHelper.Client.UserCategoryQuery(username, categoryId).PutAsync();

            return categoryId;
        }

        [HttpPut("{categoryId}/rename")]
        [Authorize]
        public async Task<ActionResult<Category>> RenameCategory(string categoryId, [FromBody] string name)
        {
            bool hasCategory = await FbHelper.Client.UserContainsCategoryAsync(User.GetUsername(), categoryId);

            if (!hasCategory) return NotFound();

            await FbHelper.Client.CategoryNameQuery(categoryId).PutAsync<string>(name);

            return await GetCategory(categoryId);
        }

        [HttpPut("{categoryId}/move")]
        public Task<ActionResult<Category>> MoveCategory(string categoryId)
        {
            string username = User.GetUsername();
            return MoveCategory(categoryId, username, username, false);
        }

        [HttpPut("{srcCategoryId}/move/{destCategoryId}")]
        public Task<ActionResult<Category>> MoveCategory(string srcCategoryId, string destCategoryId)
        {
            string username = User.GetUsername();
            return MoveCategory(srcCategoryId, destCategoryId, username, false);
        }

        private async Task<ActionResult<Category>> MoveCategory(string srcCategoryId, string destCategoryId, string username, bool checkDestCategory)
        {
            if (srcCategoryId == destCategoryId) return BadRequest();

            if (!await FbHelper.Client.UserContainsCategoryAsync(username, srcCategoryId) ||
                (checkDestCategory && !await FbHelper.Client.UserContainsCategoryAsync(username, destCategoryId))) return NotFound();

            string srcCategoryParentId = await FbHelper.Client.GetCategoryParentIdAsync(srcCategoryId);
            await FbHelper.Client.PutCategoryChildAsync(destCategoryId, srcCategoryId);
            await FbHelper.Client.CategoryParentQuery(srcCategoryId).PutAsync<string>(destCategoryId);
            await FbHelper.Client.DeleteCategoryChildAsync(srcCategoryParentId, srcCategoryId);

            return await FbHelper.Client.GetCategoryAsync(srcCategoryId);
        }

        [HttpDelete("{categoryId}")]
        public async Task<ActionResult> RemoveCategroy(string categoryId)
        {
            string username = User.GetUsername();
            bool hasCategory = await FbHelper.Client.UserContainsCategoryAsync(User.GetUsername(), categoryId);

            if (!hasCategory) return NotFound();

            Queue<string> deleteCategoryIds = new Queue<string>();
            deleteCategoryIds.Enqueue(categoryId);

            while (deleteCategoryIds.Count > 0)
            {
                string deleteCategoryId = deleteCategoryIds.Dequeue();
                Category category = await FbHelper.Client.GetCategoryAsync(deleteCategoryId);

                foreach (string gifId in category?.GifIds?.Keys.ToNotNull())
                {
                    await FbHelper.Client.GifQuery(gifId).DeleteAsync();
                }

                foreach (string childId in category?.ChildrenIds?.Keys.ToNotNull())
                {
                    deleteCategoryIds.Enqueue(childId);
                }

                await FbHelper.Client.UserCategoryQuery(username, categoryId).DeleteAsync();

                if (deleteCategoryId == categoryId)
                {
                    await FbHelper.Client.DeleteCategoryChildAsync(category.ParentId, deleteCategoryId);
                }

                await FbHelper.Client.CategoryQuery(categoryId).DeleteAsync();
            }

            return Ok();
        }
    }
}