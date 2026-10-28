using MediatR;
using Microsoft.Extensions.Logging;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;

namespace SGCS.Application.Common.Behaviors;

public class TransactionBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<TransactionBehavior<TRequest, TResponse>> _logger;

    public TransactionBehavior(
        IApplicationDbContext context,
        ILogger<TransactionBehavior<TRequest, TResponse>> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        if (request is not ITransactionalCommand || _context.Database.CurrentTransaction is not null)
            return await next();

        var requestName = typeof(TRequest).Name;

        await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
        _logger.LogDebug("Initiating transaction {TransactionId} for {RequestName}", transaction.TransactionId, requestName);

        try
        {
            var response = await next();

            if (response is Result { Succeeded: false })
            {
                _logger.LogWarning("Rolling back transaction {TransactionId} for {RequestName} because result failed", transaction.TransactionId, requestName);
                await transaction.RollbackAsync(cancellationToken);
                return response;
            }

            await transaction.CommitAsync(cancellationToken);
            _logger.LogDebug("Transaction {TransactionId} committed", transaction.TransactionId);

            return response;
        }
        catch
        {
            _logger.LogWarning("Rolling back transaction {TransactionId}", transaction.TransactionId);
            await transaction.RollbackAsync(CancellationToken.None);
            throw;
        }
    }
}
