using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Domain.Entities;

namespace SGCS.Application.Features.Ubicaciones.Commands;

public record CreateUbicacionCommand(
    string IdVariante,
    string IdEstanteria,
    int Cantidad
) : IRequest<Result<string>>;

public class CreateUbicacionCommandValidator
    : AbstractValidator<CreateUbicacionCommand>
{
    public CreateUbicacionCommandValidator()
    {
        RuleFor(x => x.IdVariante)
            .NotEmpty()
            .WithMessage("El ID de la variante es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID de la variante no debe superar los 36 caracteres.");

        RuleFor(x => x.IdEstanteria)
            .NotEmpty()
            .WithMessage("El ID de la estantería es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID de la estantería no debe superar los 36 caracteres.");

        RuleFor(x => x.Cantidad)
            .GreaterThan(0)
            .WithMessage("La cantidad debe ser mayor a 0.");
    }
}

public class CreateUbicacionCommandHandler
    : IRequestHandler<CreateUbicacionCommand, Result<string>>
{
    private readonly IApplicationDbContext _context;

    public CreateUbicacionCommandHandler(IApplicationDbContext context)
        => _context = context;

    public async Task<Result<string>> Handle(
        CreateUbicacionCommand request,
        CancellationToken cancellationToken)
    {
        // 1. Verificar existencia de la Variante
        var variante = await _context.Variantes
            .FirstOrDefaultAsync(
                v => v.Id == request.IdVariante,
                cancellationToken);

        if (variante is null)
        {
            return Result<string>.Failure(
                UbicacionErrors.VarianteNotFound(request.IdVariante));
        }

        // 2. Verificar existencia de la Estantería
        var estanteria = await _context.Estanterias
            .FirstOrDefaultAsync(
                e => e.Id == request.IdEstanteria,
                cancellationToken);

        if (estanteria is null)
        {
            return Result<string>.Failure(
                UbicacionErrors.EstanteriaNotFound(request.IdEstanteria));
        }

        // 3. Verificar que no exista ya la relación (IdVariante, IdEstanteria)
        var existingRelation = await _context.Ubicaciones
            .AnyAsync(u =>
                u.IdVariante == request.IdVariante &&
                u.IdEstanteria == request.IdEstanteria,
                cancellationToken);

        if (existingRelation)
        {
            return Result<string>.Failure(
                UbicacionErrors.RelationAlreadyExists(
                    variante.Sku,
                    estanteria.Nombre));
        }

        // 4. Crear la ubicación
        var ubicacion = new Ubicacion
        {
            IdVariante = request.IdVariante,
            IdEstanteria = request.IdEstanteria,
            Cantidad = request.Cantidad
        };

        _context.Ubicaciones.Add(ubicacion);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<string>.Success(ubicacion.Id);
    }
}

