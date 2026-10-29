namespace SGCS.Application.Common.Models;

/// <summary>
/// Representa un error estructurado con código legible por máquina, descripción, tipo y metadatos opcionales.
/// </summary>
public record Error
{
    public static readonly Error None = new(string.Empty, string.Empty, ErrorType.Failure);
    public static readonly Error NullValue = new("General.NullValue", "El valor del resultado especificado es nulo.", ErrorType.Failure);

    public string Code { get; init; }
    public string Description { get; init; }
    public ErrorType Type { get; init; }
    public Dictionary<string, object?>? Extensions { get; init; }

    public Error(string code, string description, ErrorType type, Dictionary<string, object?>? extensions = null)
    {
        Code = code;
        Description = description;
        Type = type;
        Extensions = extensions;
    }

    public static Error Failure(string code, string description, Dictionary<string, object?>? extensions = null) =>
        new(code, description, ErrorType.Failure, extensions);

    public static Error Validation(string code, string description, Dictionary<string, object?>? extensions = null) =>
        new(code, description, ErrorType.Validation, extensions);

    public static Error NotFound(string code, string description, Dictionary<string, object?>? extensions = null) =>
        new(code, description, ErrorType.NotFound, extensions);

    public static Error Conflict(string code, string description, Dictionary<string, object?>? extensions = null) =>
        new(code, description, ErrorType.Conflict, extensions);

    public static Error Forbidden(string code, string description, Dictionary<string, object?>? extensions = null) =>
        new(code, description, ErrorType.Forbidden, extensions);

    public static Error Unauthorized(string code, string description, Dictionary<string, object?>? extensions = null) =>
        new(code, description, ErrorType.Unauthorized, extensions);
}
