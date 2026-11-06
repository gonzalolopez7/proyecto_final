
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.Estanterias.Commands;

public record UpdateEstanteriaRequest(
    string Nombre,
    string? Descripcion
);

public record UpdateEstanteriaCommand(
    string Id,
    string Nombre,
    string? Descripcion
) : IRequest<Result>;

public class UpdateEstanteriaCommandValidator
    : AbstractValidator<UpdateEstanteriaCommand>
{
    public UpdateEstanteriaCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .MaximumLength(36);

        RuleFor(x => x.Nombre)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.Descripcion)
            .MaximumLength(500);
    }
}

public class UpdateEstanteriaCommandHandler
    : IRequestHandler<UpdateEstanteriaCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public UpdateEstanteriaCommandHandler(IApplicationDbContext context)
        => _context = context;

    public async Task<Result> Handle(
        UpdateEstanteriaCommand request,
        CancellationToken cancellationToken)
    {
        var estanteria = await _context.Estanterias
            .FirstOrDefaultAsync(
                e => e.Id == request.Id,
                cancellationToken);

        if (estanteria is null)
        {
            return Result.Failure(
                EstanteriaErrors.NotFound(request.Id));
        }

        var nombre = request.Nombre.Trim();

        // Buscar también estanterías eliminadas lógicamente.
        var existing = await _context.Estanterias
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(
                e => e.IdDeposito == estanteria.IdDeposito &&
                     e.Nombre == nombre &&
                     e.Id != request.Id,
                cancellationToken);

        if (existing is not null)
        {
            if (existing.IsDeleted)
            {
                return Result.Failure(
                    EstanteriaErrors.SoftDeletedNombre(
                        existing.Nombre,
                        existing.Id));
            }

            return Result.Failure(
                EstanteriaErrors.NameAlreadyExists(nombre));
        }

        estanteria.Nombre = nombre;
        estanteria.Descripcion = request.Descripcion?.Trim();

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
