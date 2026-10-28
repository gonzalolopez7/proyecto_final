namespace SGCS.Application.Common.Interfaces;

/// <summary>
/// Abstracción para obtener el usuario autenticado actual.
/// Implementado en Infrastructure usando HttpContext.
/// </summary>
public interface ICurrentUserService
{
    /// <summary>
    /// Id del usuario autenticado actual, o null si no está autenticado.
    /// </summary>
    string? UserId { get; }

    /// <summary>
    /// Indica si hay un usuario autenticado.
    /// </summary>
    bool IsAuthenticated { get; }
}
