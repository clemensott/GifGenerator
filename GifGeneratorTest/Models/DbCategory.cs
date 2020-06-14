using System.Collections.Generic;

namespace GifGeneratorTest.Models
{
    public class DbCategory
    {
        public string Id { get; set; }

        public string Name { get; set; }

        public IEnumerable<DbCategory> Children { get; set; }

        public IEnumerable<DbGif> Gifs { get; set; }

        public DbCategory() { }

        public DbCategory(string id, string name = default(string), DbCategory child = null, DbGif gif = null)
        {
            Id = id;
            Name = name;
            if (child != null) Children = new[] {child};
            if (gif != null) Gifs = new[] {gif};
        }
    }
}
