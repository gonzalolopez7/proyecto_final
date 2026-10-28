namespace SGCS.Application.Common.Interfaces;

/// <summary>
/// Abstracción para generación y validación de tokens JWT.
/// Implementado en Infrastructure.
/// </summary>
public interface ITokenService
{
    /// <summary>
    /// Genera un access token JWT para el usuario especificado.
    /// </summary>
    /// <param name="userId">Id del usuario.</param>
    /// <param name="email">Email del usuario.</param>
    /// <param name="roles">Roles del usuario.</param>
    /// <returns>Token JWT firmado.</returns>
    string GenerateAccessToken(string userId, string role);
}
