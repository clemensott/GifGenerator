namespace GifGenerator.Models.Categories
{
    public class CategoryChildInfo
    {
        public string Id { get; set; }

        public string Name { get; set; }

        public CategoryChildInfo(string id, string name)
        {
            Id = id;
            Name = name;
        }
    }
}