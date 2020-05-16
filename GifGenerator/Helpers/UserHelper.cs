using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Primitives;
using System.Linq;
using System.Security.Claims;

namespace GifGenerator.Helpers
{
    public static class UserHelper
    {
        public const string CookieName = "auth";

        public static bool IsValidUsername(string username)
        {
            return !username.Contains(' ') && !string.IsNullOrEmpty(username);
        }

        public static bool IsPasswordValid(string password)
        {
            return password.Length >= 6;
        }

        public static bool TryGetToken(this HttpRequest request, out string token)
        {
            if (request.Headers.TryGetValue(CookieName, out StringValues tokens))
            {
                token = tokens.First();
            }
            else if (!request.Cookies.TryGetValue(CookieName, out token))
            {
                return false;
            }

            return true;
        }

        public static string GetToken(this HttpRequest request)
        {
            return TryGetToken(request, out string token) ? token : null;
        }

        public static string GetUsername(this ClaimsPrincipal principal)
        {
            return principal.Claims.First(c => c.Type == ClaimTypes.NameIdentifier).Value;
        }
    }
}