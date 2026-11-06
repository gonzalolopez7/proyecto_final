using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.Depositos.Commands;

public record DeleteDepositoCommand(string Id) : IRequest<Result>;

public class DeleteDepositoCommandValidator
    : AbstractValidator<DeleteDepositoCommand>
{
    public DeleteDepositoCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .MaximumLength(36);
    }
}

public class DeleteDepositoCommandHandler
    : IRequestHandler<DeleteDepositoCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public DeleteDepositoCommandHandler(IApplicationDbContext context)
        => _context = context;

    public async Task<Result> Handle(
        DeleteDepositoCommand request,
        CancellationToken cancellationToken)
    {
        var deposito = await _context.Depositos
            .FirstOrDefaultAsync(d => d.Id == request.Id, cancellationToken);

        if (deposito is null)
            return Result.Failure(DepositoErrors.NotFound(request.Id));

        var hasStock = await _context.Ubicaciones
            .IgnoreQueryFilters()
            .AnyAsync(u =>
                u.Estanteria.IdDeposito == request.Id &&
                u.Cantidad > 0,
                cancellationToken);

        if (hasStock)
            return Result.Failure(DepositoErrors.HasStock(request.Id));

        var hasActiveShelves = await _context.Estanterias
            .AnyAsync(e => e.IdDeposito == request.Id, cancellationToken);

        if (hasActiveShelves)
            return Result.Failure(
                DepositoErrors.HasActiveShelves(request.Id));

        deposito.IsDeleted = true;
        deposito.DeletedAt = DateTime.UtcNow;
        deposito.DeletedBy = null;

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}