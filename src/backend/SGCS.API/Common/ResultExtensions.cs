using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using SGCS.Application.Common.Models;

namespace SGCS.API.Common;

public static class ResultExtensions
{
    /// <summary>
    /// Traduce un Result fallido a una respuesta ProblemDetails estandarizada (RFC 7807/9457)
    /// mapeando el ErrorType a su código HTTP correspondiente e incluyendo código de error y extensiones.
    /// </summary>
    public static ActionResult ToProblemDetails(this ControllerBase controller, Result result)
    {
        if (result.Succeeded)
            throw new InvalidOperationException("No se puede generar ProblemDetails a partir de un resultado exitoso.");

        var error = result.Error;

        var statusCode = error.Type switch
        {
            ErrorType.Validation => StatusCodes.Status400BadRequest,
            ErrorType.NotFound => StatusCodes.Status404NotFound,
            ErrorType.Conflict => StatusCodes.Status409Conflict,
            ErrorType.Unauthorized => StatusCodes.Status401Unauthorized,
            ErrorType.Forbidden => StatusCodes.Status403Forbidden,
            _ => StatusCodes.Status500InternalServerError
        };

        var title = error.Type switch
        {
            ErrorType.Validation => "Validation failure",
            ErrorType.NotFound => "Resource not found",
            ErrorType.Conflict => "Conflict",
            ErrorType.Unauthorized => "Unauthorized",
            ErrorType.Forbidden => "Forbidden",
            _ => "An unexpected error occurred"
        };

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = error.Description,
            Instance = controller.HttpContext.Request.Path
        };

        if (!string.IsNullOrWhiteSpace(error.Code))
        {
            problemDetails.Extensions["code"] = error.Code;
        }

        if (error.Extensions is not null)
        {
            foreach (var (key, value) in error.Extensions)
            {
                problemDetails.Extensions[key] = value;
            }
        }

        if (result.Errors.Length > 1)
        {
            problemDetails.Extensions["errors"] = result.Errors
                .Select(e => new
                {
                    code = e.Code,
                    description = e.Description,
                    type = e.Type.ToString()
                })
                .ToArray();
        }

        problemDetails.Extensions["traceId"] = Activity.Current?.TraceId.ToString() ?? controller.HttpContext.TraceIdentifier;

        var objectResult = new ObjectResult(problemDetails)
        {
            StatusCode = statusCode
        };
        objectResult.ContentTypes.Add("application/problem+json");

        return objectResult;
    }
}
