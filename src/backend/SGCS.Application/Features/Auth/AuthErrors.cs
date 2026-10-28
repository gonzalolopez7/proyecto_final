using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.Auth;

public static class AuthErrors
{
    public static readonly Error InvalidCredentials =
        Error.Unauthorized(
            "Auth.InvalidCredentials",
            "Nombre de usuario o contraseña incorrectos.");
}
