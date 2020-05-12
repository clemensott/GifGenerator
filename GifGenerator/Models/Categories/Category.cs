using System.Collections.Generic;

namespace GifGenerator.Models
{
    public class Category
    {
        public string Name { get; set; }

        public string ParentId { get; set; }

        public Dictionary<string, bool> ChildrenIds { get; set; }

        public Dictionary<string, bool> GifIds { get; set; }

        public Category()
        {
            ChildrenIds = new Dictionary<string, bool>();
            GifIds = new Dictionary<string, bool>();
        }
    }
}
