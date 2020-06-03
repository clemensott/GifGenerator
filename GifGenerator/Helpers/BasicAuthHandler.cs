using System;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using System.Text.Encodings.Web;
using System.Threading.Tasks;
using GifGenerator.Models.Users;

namespace GifGenerator.Helpers
{
    public class BasicAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
    {
        public BasicAuthHandler(IOptionsMonitor<AuthenticationSchemeOptions> options, ILoggerFactory logger,
            UrlEncoder encoder, ISystemClock clock, IConfiguration configuration) : base(options, logger, encoder,
            clock) { }

        protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            if (!Request.TryGetToken(out string token))
            {
                return AuthenticateResult.NoResult();
            }

            Login login = string.IsNullOrWhiteSpace(token)
                ? null
                : await FbDbHelper.Client.GetLoginAsync(token);

            if (login == null) return AuthenticateResult.Fail("Invalid auth token");
            if (login.Expires < DateTimeOffset.Now) return AuthenticateResult.Fail("Token expired");

            Claim[] claims = new[] {new Claim(ClaimTypes.NameIdentifier, login.Username)};
            ClaimsIdentity identity = new ClaimsIdentity(claims, Scheme.Name);
            ClaimsPrincipal principal = new ClaimsPrincipal(identity);
            AuthenticationTicket ticket = new AuthenticationTicket(principal, Scheme.Name);

            return AuthenticateResult.Success(ticket);
        }
    }
}