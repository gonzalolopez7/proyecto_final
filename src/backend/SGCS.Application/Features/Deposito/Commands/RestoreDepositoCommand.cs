
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.Depositos.Commands;

public record RestoreDepositoCommand(string Id) : IRequest<Result>;

public class RestoreDepositoCommandValidator
    : AbstractValidator<RestoreDepositoCommand>
{
    public RestoreDepositoCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .MaximumLength(36);
    }
}

public class RestoreDepositoCommandHandler
    : IRequestHandler<RestoreDepositoCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public RestoreDepositoCommandHandler(IApplicationDbContext context)
        => _context = context;

    public async Task<Result> Handle(
        RestoreDepositoCommand request,
        CancellationToken cancellationToken)
    {
        var deposito = await _context.Depositos
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(
                d => d.Id == request.Id,
                cancellationToken);

        if (deposito is null)
        {
            return Result.Failure(
                DepositoErrors.NotFound(request.Id));
        }

        if (!deposito.IsDeleted)
        {
            return Result.Failure(
                DepositoErrors.NotDeleted(request.Id));
        }

        deposito.IsDeleted = false;
        deposito.DeletedAt = null;
        deposito.DeletedBy = null;

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
