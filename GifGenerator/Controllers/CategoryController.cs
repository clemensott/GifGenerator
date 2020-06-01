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
        [HttpGet("{categoryId}")]
        [Authorize]
        public async Task<ActionResult<CategoryInfo>> GetCategoryInfo(string categoryId)
        {
            if (!FbDbHelper.IsValidKey(categoryId)) return BadRequest();

            string username = User.GetUsername();
            bool hasCategory = await FbDbHelper.Client.UserContainsCategoryAsync(username, categoryId);
            if (!hasCategory) return NotFound();

            Category category = await FbDbHelper.Client.GetCategoryAsync(categoryId);

            return await GetCategoryInfo(categoryId, category ?? new Category());
        }

        private static async Task<CategoryInfo> GetCategoryInfo(string categoryId, Category category)
        {
            return new CategoryInfo(categoryId, category.Name, category.ParentId)
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
            if (!FbDbHelper.IsValidKey(categoryId)) return BadRequest();

            string username = User.GetUsername();
            bool hasParentId = await FbDbHelper.Client.UserContainsCategoryAsync(username, categoryId);

            if (!hasParentId) return NotFound();

            Stack<CategoryChildInfo> stack = new Stack<CategoryChildInfo>();

            while (!string.IsNullOrWhiteSpace(categoryId))
            {
                Category category = await FbDbHelper.Client.GetCategoryAsync(categoryId);
                stack.Push(new CategoryChildInfo(categoryId, category.Name));
                categoryId = category.ParentId;
            }
            
            return stack;
        }

        [HttpPost("{parentId}/create")]
        [Authorize]
        public async Task<ActionResult<string>> CreateCategory(string parentId, [FromBody] string name)
        {
            if (!FbDbHelper.IsValidKey(parentId)) return BadRequest();

            string username = User.GetUsername();
            bool hasParentId = await FbDbHelper.Client.UserContainsCategoryAsync(username, parentId);
            if (!hasParentId) return NotFound();

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
            if (!FbDbHelper.IsValidKey(categoryId)) return BadRequest();

            bool hasCategory = await FbDbHelper.Client.UserContainsCategoryAsync(User.GetUsername(), categoryId);
            if (!hasCategory) return NotFound();

            await FbDbHelper.Client.CategoryNameQuery(categoryId).PutAsync<string>(name);

            return await GetCategoryInfo(categoryId);
        }

        [HttpPut("{categoryId}/move/{destCategoryId}")]
        public Task<ActionResult> MoveCategory(string categoryId, string destCategoryId)
        {
            string username = User.GetUsername();
            return MoveCategory(categoryId, destCategoryId, username, false);
        }

        private async Task<ActionResult> MoveCategory(string categoryId, string destCategoryId,
            string username, bool checkDestCategory)
        {
            if (categoryId == destCategoryId || !FbDbHelper.IsValidKey(categoryId) ||
                !FbDbHelper.IsValidKey(destCategoryId)) return BadRequest();

            string rootCategoryId = await FbDbHelper.Client.GetUserRootCategoryIdAsync(username);
            if (categoryId == rootCategoryId) return BadRequest();

            if (!await FbDbHelper.Client.UserContainsCategoryAsync(username, categoryId) ||
                (checkDestCategory && !await FbDbHelper.Client.UserContainsCategoryAsync(username, destCategoryId)))
                return NotFound();

            string srcCategoryParentId = await FbDbHelper.Client.GetCategoryParentIdAsync(categoryId);
            await FbDbHelper.Client.PutCategoryChildAsync(destCategoryId, categoryId);
            await FbDbHelper.Client.CategoryParentQuery(categoryId).PutAsync<string>(destCategoryId);
            await FbDbHelper.Client.DeleteCategoryChildAsync(srcCategoryParentId, categoryId);

            return Ok();
        }

        [HttpDelete("{categoryId}")]
        public async Task<ActionResult> RemoveCategory(string categoryId)
        {
            if (!FbDbHelper.IsValidKey(categoryId)) return BadRequest();

            string username = User.GetUsername();

            string rootCategoryId = await FbDbHelper.Client.GetUserRootCategoryIdAsync(username);
            if (categoryId == rootCategoryId) return BadRequest();

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
