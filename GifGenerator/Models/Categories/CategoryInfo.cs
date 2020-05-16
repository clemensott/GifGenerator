using System.Collections.Generic;
using GifGenerator.Models.Gifs;

namespace GifGenerator.Models.Categories
{
    public class CategoryInfo
    {
        public string Id { get; set; }

        public string Name { get; set; }

        public string ParentId { get; set; }

        public CategoryChildInfo[] Children { get; set; }

        public GifInfo[] Gifs { get; set; }

        public CategoryInfo(string id, string name, string parentId)
        {
            Id = id;
            Name = name;
            ParentId = parentId;
            Children = new CategoryChildInfo[0];
            Gifs = new GifInfo[0];
        }
    }
}