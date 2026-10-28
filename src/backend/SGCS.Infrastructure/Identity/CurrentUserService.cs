using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using SGCS.Application.Common.Interfaces;

namespace SGCS.Infrastructure.Identity;

/// <summary>
/// Implementación de ICurrentUserService para acceder a la información del usuario autenticado
/// en la petición HTTP actual a través de IHttpContextAccessor.
/// </summary>
public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string? UserId =>
        _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);

    public bool IsAuthenticated =>
        _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;
}
