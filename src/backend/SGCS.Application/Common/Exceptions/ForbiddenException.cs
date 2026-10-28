namespace SGCS.Application.Common.Exceptions;

/// <summary>
/// Excepción para acceso prohibido (usuario autenticado pero sin permisos).
/// Mapeada a HTTP 403 Forbidden.
/// </summary>
public class ForbiddenException : Exception
{
    public ForbiddenException() : base() { }

    public ForbiddenException(string message)
        : base(message) { }

    public ForbiddenException(string message, Exception innerException)
        : base(message, innerException) { }
}
