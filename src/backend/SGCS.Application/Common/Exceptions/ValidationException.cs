namespace SGCS.Application.Common.Exceptions;

/// <summary>
/// Excepción de validación que contiene un diccionario de errores por campo.
/// Lanzada por el ValidationBehavior cuando FluentValidation falla.
/// Mapeada a HTTP 400 Bad Request con detalle de errores.
/// </summary>
public class ValidationException : Exception
{
    public IDictionary<string, string[]> Errors { get; }

    public ValidationException()
        : base("Se produjeron uno o más errores de validación.")
    {
        Errors = new Dictionary<string, string[]>();
    }

    public ValidationException(IEnumerable<FluentValidation.Results.ValidationFailure> failures)
        : this()
    {
        Errors = failures
            .GroupBy(e => e.PropertyName, e => e.ErrorMessage)
            .ToDictionary(failureGroup => failureGroup.Key, failureGroup => failureGroup.ToArray());
    }
}
