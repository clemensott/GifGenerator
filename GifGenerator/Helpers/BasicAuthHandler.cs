using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text.Encodings.Web;
using System.Threading.Tasks;

namespace GifGenerator.Helpers
{
    public class BasicAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
    {
        public BasicAuthHandler(IOptionsMonitor<AuthenticationSchemeOptions> options, ILoggerFactory logger,
            UrlEncoder encoder, ISystemClock clock, IConfiguration configuration) : base(options, logger, encoder, clock)
        {
        }

        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            return new ValueTask<AuthenticateResult>(HandleAuth()).AsTask();
        }

        private AuthenticateResult HandleAuth()
        {
            //if (Request.Headers.ContainsKey("password"))
            //{
            //    if (Request.Headers["password"] != "secure") return AuthenticateResult.Fail("Wrong password in header");
            //}
            //else return AuthenticateResult.Fail("Password is missing");

            Claim[] claims = new[] { new Claim(ClaimTypes.Name, "Admin") };
            ClaimsIdentity identity = new ClaimsIdentity(claims, Scheme.Name);
            ClaimsPrincipal principal = new ClaimsPrincipal(identity);
            AuthenticationTicket ticket = new AuthenticationTicket(principal, Scheme.Name);

            return AuthenticateResult.Success(ticket);
        }
    }
}
