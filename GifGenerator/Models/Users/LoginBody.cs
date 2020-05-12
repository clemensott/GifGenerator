using System.ComponentModel.DataAnnotations;

namespace GifGenerator.Models.Users
{
    public class LoginBody
    {
        [Required]
        public string Username { get; set; }

        [Required]
        public string Password { get; set; }

        public bool KeepLoggedIn { get; set; }
    }
}
