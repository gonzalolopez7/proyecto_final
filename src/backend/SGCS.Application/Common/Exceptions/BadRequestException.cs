namespace SGCS.Application.Common.Exceptions;

/// <summary>
/// Excepción para solicitudes inválidas del cliente.
/// Mapeada a HTTP 400 Bad Request.
/// </summary>
public class BadRequestException : Exception
{
    public BadRequestException() : base() { }

    public BadRequestException(string message)
        : base(message) { }

    public BadRequestException(string message, Exception innerException)
        : base(message, innerException) { }
}
