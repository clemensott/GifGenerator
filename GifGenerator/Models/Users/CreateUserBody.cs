using System.ComponentModel.DataAnnotations;

namespace GifGenerator.Models.Users
{
    public class CreateUserBody
    {
        [Required]
        public string Username { get; set; }

        [Required]
        public string Password { get; set; }
    }
}
