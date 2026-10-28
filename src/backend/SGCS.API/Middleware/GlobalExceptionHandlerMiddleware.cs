using System.Diagnostics;
using System.Text.Json;
using MediatR;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using SGCS.Application.Common.Exceptions;
using SGCS.Domain.Exceptions;

namespace SGCS.API.Middleware;

public class GlobalExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;

    public GlobalExceptionHandlerMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlerMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        if (exception is OperationCanceledException && context.RequestAborted.IsCancellationRequested)
            return;


        var (status, title, code) = exception switch
        {
            ValidationException => (StatusCodes.Status400BadRequest, "Validation failure", "General.Validation"),
            BadRequestException => (StatusCodes.Status400BadRequest, "Bad request", "General.BadRequest"),
            NotFoundException => (StatusCodes.Status404NotFound, "Resource not found", "General.NotFound"),
            DomainException => (StatusCodes.Status400BadRequest, "Business rule violation", "General.DomainError"),
            ForbiddenException => (StatusCodes.Status403Forbidden, "Forbidden", "General.Forbidden"),
            UnauthorizedAccessException => (StatusCodes.Status401Unauthorized, "Unauthorized", "General.Unauthorized"),
            _ => (StatusCodes.Status500InternalServerError, "An unexpected error occurred", "General.Unexpected")
        };

        if (status >= 500)
        {
            if (!exception.Data.Contains("Logged"))
                _logger.LogError(exception, "Unhandled exception on {Method} {Path}", context.Request.Method, context.Request.Path);
        }
        else
        {
            _logger.LogInformation("Handled exception on {Method} {Path}", context.Request.Method, context.Request.Path);
        }

        if (context.Response.HasStarted)
        {
            _logger.LogWarning("Response has already started, cannot write ProblemDetails");
            return;
        }

        var problemDetails = new ProblemDetails
        {
            Status = status,
            Title = title,
            Instance = context.Request.Path,
            Detail = status >= 500 ? null : exception.Message
        };

        problemDetails.Extensions["code"] = code;

        if (exception is ValidationException ve)
            problemDetails.Extensions["errors"] = ve.Errors;

        problemDetails.Extensions["traceId"] = Activity.Current?.TraceId.ToString() ?? context.TraceIdentifier;

        context.Response.StatusCode = status;
        await context.Response.WriteAsJsonAsync(
            problemDetails,
            options: null,
            contentType: "application/problem+json"
        );
    }
}
