
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.Estanterias.Commands;

public record RestoreEstanteriaCommand(string Id) : IRequest<Result>;

public class RestoreEstanteriaCommandValidator
    : AbstractValidator<RestoreEstanteriaCommand>
{
    public RestoreEstanteriaCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .MaximumLength(36);
    }
}

public class RestoreEstanteriaCommandHandler
    : IRequestHandler<RestoreEstanteriaCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public RestoreEstanteriaCommandHandler(IApplicationDbContext context)
        => _context = context;

    public async Task<Result> Handle(
        RestoreEstanteriaCommand request,
        CancellationToken cancellationToken)
    {
        var estanteria = await _context.Estanterias
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(
                e => e.Id == request.Id,
                cancellationToken);

        if (estanteria is null)
        {
            return Result.Failure(
                EstanteriaErrors.NotFound(request.Id));
        }

        if (!estanteria.IsDeleted)
        {
            return Result.Failure(
                EstanteriaErrors.NotDeleted(request.Id));
        }

        // No restaurar una estantería si su depósito fue eliminado.
        var deposito = await _context.Depositos
            .FirstOrDefaultAsync(
                d => d.Id == estanteria.IdDeposito,
                cancellationToken);

        if (deposito is null)
        {
            return Result.Failure(
                EstanteriaErrors.DepositoNotFound(estanteria.IdDeposito));
        }

        estanteria.IsDeleted = false;
        estanteria.DeletedAt = null;
        estanteria.DeletedBy = null;

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
