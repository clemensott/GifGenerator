using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Firebase.Database;
using Firebase.Database.Query;
using GifGenerator.Helpers;
using GifGenerator.Models.Categories;
using GifGenerator.Models.Gifs;
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
        public Task<ActionResult<CategoryInfo>> GetCategoryInfo()
        {
            string username = User.GetUsername();
            return GetCategoryInfo(username, username, false);
        }

        [HttpGet("{categoryId}")]
        [Authorize]
        public Task<ActionResult<CategoryInfo>> GetCategoryInfo(string categoryId)
        {
            return GetCategoryInfo(categoryId, User.GetUsername(), true);
        }

        private async Task<ActionResult<CategoryInfo>> GetCategoryInfo(string categoryId, string username,
            bool checkUserHasCategoryId)
        {
            if (checkUserHasCategoryId)
            {
                bool hasCategory = await FbDbHelper.Client.UserContainsCategoryAsync(username, categoryId);

                if (!hasCategory) return NotFound();
            }

            Category category = await FbDbHelper.Client.GetCategoryAsync(categoryId);

            return await GetCategoryInfo(categoryId, category ?? new Category(), username);
        }

        private static async Task<CategoryInfo> GetCategoryInfo(string categoryId, Category category, string username)
        {
            string id = categoryId == username ? string.Empty : categoryId;
            string name = string.IsNullOrWhiteSpace(category.ParentId) ? username : category.Name;
            string parentId = category.ParentId == username ? string.Empty : category.ParentId;
            
            return new CategoryInfo(id, name, parentId)
            {
                Children = await Task.WhenAll(category.ChildrenIds?.Keys.ToNotNull().Select(async childId =>
                {
                    string childName = await FbDbHelper.Client.GetCategoryNameAsync(childId);
                    return new CategoryChildInfo(childId, childName);
                })),
                Gifs = await Task.WhenAll(category.GifIds?.Keys.ToNotNull().Select(async gifId =>
                {
                    Gif gif = await FbDbHelper.Client.GetGifAsync(gifId);
                    return new GifInfo(gifId, gif);
                }))
            };
        }

        [HttpGet("{categoryId}/path")]
        public async Task<ActionResult<IEnumerable<CategoryChildInfo>>> Parents(string categoryId)
        {
            string username = User.GetUsername();
            bool hasParentId = await FbDbHelper.Client.UserContainsCategoryAsync(username, categoryId);

            if (!hasParentId) return NotFound();

            Stack<CategoryChildInfo> stack = new Stack<CategoryChildInfo>();

            while (true)
            {
                Category category = await FbDbHelper.Client.GetCategoryAsync(categoryId);
                if (string.IsNullOrWhiteSpace(category.ParentId))
                {
                    stack.Push(new CategoryChildInfo(null, username));
                    return stack;
                }

                stack.Push(new CategoryChildInfo(categoryId, category.Name));
                categoryId = category.ParentId;
            }
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

        private async Task<ActionResult<string>> CreateCategory(string name, string parentId, string username,
            bool checkParentId)
        {
            if (checkParentId)
            {
                bool hasParentId = await FbDbHelper.Client.UserContainsCategoryAsync(username, parentId);
                if (!hasParentId) return NotFound();
            }

            Category category = new Category()
            {
                Name = name,
                ParentId = parentId,
            };

            FirebaseObject<Category> addedCategory = await FbDbHelper.Client.CategoriesQuery().PostAsync(category);
            string categoryId = addedCategory.Key;

            await FbDbHelper.Client.PutCategoryChildAsync(parentId, categoryId);
            await FbDbHelper.Client.UserCategoryQuery(username, categoryId).PutAsync();

            return categoryId;
        }

        [HttpPut("{categoryId}/rename")]
        [Authorize]
        public async Task<ActionResult<CategoryInfo>> RenameCategory(string categoryId, [FromBody] string name)
        {
            bool hasCategory = await FbDbHelper.Client.UserContainsCategoryAsync(User.GetUsername(), categoryId);

            if (!hasCategory) return NotFound();

            await FbDbHelper.Client.CategoryNameQuery(categoryId).PutAsync<string>(name);

            return await GetCategoryInfo(categoryId);
        }

        [HttpPut("{categoryId}/move")]
        public Task<ActionResult> MoveCategory(string categoryId)
        {
            string username = User.GetUsername();
            return MoveCategory(categoryId, username, username, false);
        }

        [HttpPut("{srcCategoryId}/move/{destCategoryId}")]
        public Task<ActionResult> MoveCategory(string srcCategoryId, string destCategoryId)
        {
            string username = User.GetUsername();
            return MoveCategory(srcCategoryId, destCategoryId, username, false);
        }

        private async Task<ActionResult> MoveCategory(string srcCategoryId, string destCategoryId,
            string username, bool checkDestCategory)
        {
            if (srcCategoryId == destCategoryId) return BadRequest();

            if (!await FbDbHelper.Client.UserContainsCategoryAsync(username, srcCategoryId) ||
                (checkDestCategory && !await FbDbHelper.Client.UserContainsCategoryAsync(username, destCategoryId)))
                return NotFound();

            string srcCategoryParentId = await FbDbHelper.Client.GetCategoryParentIdAsync(srcCategoryId);
            await FbDbHelper.Client.PutCategoryChildAsync(destCategoryId, srcCategoryId);
            await FbDbHelper.Client.CategoryParentQuery(srcCategoryId).PutAsync<string>(destCategoryId);
            await FbDbHelper.Client.DeleteCategoryChildAsync(srcCategoryParentId, srcCategoryId);

            return Ok();
        }

        [HttpDelete("{categoryId}")]
        public async Task<ActionResult> RemoveCategory(string categoryId)
        {
            string username = User.GetUsername();
            bool hasCategory = await FbDbHelper.Client.UserContainsCategoryAsync(User.GetUsername(), categoryId);

            if (!hasCategory) return NotFound();

            Queue<string> deleteCategoryIds = new Queue<string>();
            deleteCategoryIds.Enqueue(categoryId);

            while (deleteCategoryIds.Count > 0)
            {
                string deleteCategoryId = deleteCategoryIds.Dequeue();
                Category category = await FbDbHelper.Client.GetCategoryAsync(deleteCategoryId);

                foreach (string gifId in category?.GifIds?.Keys.ToNotNull())
                {
                    await FbDbHelper.Client.GifQuery(gifId).DeleteAsync();
                }

                foreach (string childId in category?.ChildrenIds?.Keys.ToNotNull())
                {
                    deleteCategoryIds.Enqueue(childId);
                }

                await FbDbHelper.Client.UserCategoryQuery(username, categoryId).DeleteAsync();

                if (deleteCategoryId == categoryId && category != null)
                {
                    await FbDbHelper.Client.DeleteCategoryChildAsync(category.ParentId, deleteCategoryId);
                }

                await FbDbHelper.Client.CategoryQuery(categoryId).DeleteAsync();
            }

            return Ok();
        }
    }
}