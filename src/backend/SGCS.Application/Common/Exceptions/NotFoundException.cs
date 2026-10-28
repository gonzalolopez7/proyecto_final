namespace SGCS.Application.Common.Exceptions;

/// <summary>
/// Excepción para recursos no encontrados.
/// Mapeada a HTTP 404 Not Found.
/// </summary>
public class NotFoundException : Exception
{
    public NotFoundException() : base() { }

    public NotFoundException(string message)
        : base(message) { }

    public NotFoundException(string message, Exception innerException)
        : base(message, innerException) { }

    public NotFoundException(string name, object key)
        : base($"La entidad \"{name}\" ({key}) no fue encontrada.") { }
}
