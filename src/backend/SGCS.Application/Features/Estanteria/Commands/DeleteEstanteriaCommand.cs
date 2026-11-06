using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.Estanterias.Commands;

public record DeleteEstanteriaCommand(string Id) : IRequest<Result>;

public class DeleteEstanteriaCommandValidator
    : AbstractValidator<DeleteEstanteriaCommand>
{
    public DeleteEstanteriaCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID de la estantería es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID de la estantería no debe superar los 36 caracteres.");
    }
}

public class DeleteEstanteriaCommandHandler
    : IRequestHandler<DeleteEstanteriaCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public DeleteEstanteriaCommandHandler(IApplicationDbContext context)
        => _context = context;

    public async Task<Result> Handle(
        DeleteEstanteriaCommand request,
        CancellationToken cancellationToken)
    {
        var estanteria = await _context.Estanterias
            .FirstOrDefaultAsync(e => e.Id == request.Id, cancellationToken);

        if (estanteria is null)
            return Result.Failure(
                EstanteriaErrors.NotFound(request.Id));

        var hasStock = await _context.Ubicaciones
            .IgnoreQueryFilters()
            .AnyAsync(u =>
                u.IdEstanteria == request.Id &&
                u.Cantidad > 0,
                cancellationToken);

        if (hasStock)
            return Result.Failure(
                EstanteriaErrors.HasStock(request.Id));

        _context.Estanterias.Remove(estanteria);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
