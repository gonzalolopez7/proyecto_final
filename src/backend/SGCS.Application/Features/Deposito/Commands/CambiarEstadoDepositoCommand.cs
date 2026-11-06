using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.Depositos.Commands;

public record CambiarEstadoDepositoCommand(
    string Id,
    bool Activo
) : IRequest<Result>;

public record ChangeDepositoStatusRequest(
    bool Activo
);

public class CambiarEstadoDepositoCommandValidator
    : AbstractValidator<CambiarEstadoDepositoCommand>
{
    public CambiarEstadoDepositoCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .MaximumLength(36);
    }
}

public class CambiarEstadoDepositoCommandHandler
    : IRequestHandler<CambiarEstadoDepositoCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public CambiarEstadoDepositoCommandHandler(
        IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(
        CambiarEstadoDepositoCommand request,
        CancellationToken cancellationToken)
    {
        var deposito = await _context.Depositos
            .FirstOrDefaultAsync(
                d => d.Id == request.Id,
                cancellationToken
            );

        if (deposito is null)
            return Result.Failure(
                DepositoErrors.NotFound(request.Id)
            );

        if (deposito.Activo == request.Activo)
            return Result.Failure(
                DepositoErrors.AlreadyInState(
                    request.Id,
                    request.Activo
                )
            );

        deposito.Activo = request.Activo;

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}