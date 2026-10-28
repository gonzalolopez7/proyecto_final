using MediatR;
using Microsoft.Extensions.Logging;
using SGCS.Application.Common.Exceptions;
using SGCS.Domain.Exceptions;

namespace SGCS.Application.Common.Behaviors;

public class UnhandledExceptionBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly ILogger<TRequest> _logger;

    public UnhandledExceptionBehavior(ILogger<TRequest> logger)
    {
        _logger = logger;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        try
        {
            return await next();
        }
        catch (Exception ex) when (IsUnhandledException(ex))
        {
            _logger.LogError(ex, "Unhandled exception in {RequestName}", typeof(TRequest).Name);
            ex.Data["Logged"] = true;
            throw;
        }
    }

    private static bool IsUnhandledException(Exception ex) => ex is not ValidationException
                                                           && ex is not DomainException
                                                           && ex is not NotFoundException
                                                           && ex is not BadRequestException
                                                           && ex is not ForbiddenException
                                                           && ex is not UnauthorizedAccessException;
}
