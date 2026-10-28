using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using SGCS.Application.Common.Interfaces;

namespace SGCS.Infrastructure.Services;

public class TokenService : ITokenService
{
    private readonly JsonWebTokenHandler _tokenHandler = new();
    private readonly SigningCredentials _credentials;
    private readonly string _issuer;
    private readonly string _audience;
    private int _expirationMinutes;

    public TokenService(IConfiguration configuration)
    {
        var jwtSection = configuration.GetRequiredSection("JwtSettings");

        // Already validated at startup in the DI registration
        _issuer = jwtSection["Issuer"]!;
        _audience = jwtSection["Audience"]!;
        _expirationMinutes = int.Parse(jwtSection["ExpirationMinutes"]!);

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSection["SecretKey"]!));
        _credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
    }

    public string GenerateAccessToken(string userId, string role)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(ClaimTypes.Role, role)
        };

        var now = DateTime.UtcNow;

        var descriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            NotBefore = now,
            IssuedAt = now,
            Expires = now.AddMinutes(_expirationMinutes),
            Issuer = _issuer,
            Audience = _audience,
            SigningCredentials = _credentials,
        };

        return _tokenHandler.CreateToken(descriptor);
    }
}
