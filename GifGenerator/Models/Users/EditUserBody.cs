using System.ComponentModel.DataAnnotations;

namespace GifGenerator.Models.Users
{
    public class EditUserBody
    {
        [Required]
        public string NewPassword { get; set; }
    }
}
