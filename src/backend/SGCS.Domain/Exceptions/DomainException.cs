namespace SGCS.Domain.Exceptions;

/// <summary>
/// Excepción base para errores de reglas de negocio del dominio.
/// </summary>
public class DomainException : Exception
{
    public DomainException() { }

    public DomainException(string message)
        : base(message) { }

    public DomainException(string message, Exception innerException)
        : base(message, innerException) { }
}
