namespace SGCS.Application.Common.Models;

/// <summary>
/// Tipos de error estándar para categorizar fallas de la aplicación y mapearlas a códigos de estado HTTP.
/// </summary>
public enum ErrorType
{
    Failure = 0,
    Validation = 1,
    NotFound = 2,
    Conflict = 3,
    Forbidden = 4,
    Unauthorized = 5
}
