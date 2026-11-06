using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Domain.Entities;

namespace SGCS.Application.Features.Ubicaciones.Commands;

public record AsignarUbicacionCommand(
    string IdVariante,
    string IdEstanteria,
    int Cantidad
) : IRequest<Result<string>>;

public class AsignarUbicacionCommandValidator
    : AbstractValidator<AsignarUbicacionCommand>
{
    public AsignarUbicacionCommandValidator()
    {
        RuleFor(x => x.IdVariante)
            .NotEmpty()
            .MaximumLength(36);

        RuleFor(x => x.IdEstanteria)
            .NotEmpty()
            .MaximumLength(36);

        RuleFor(x => x.Cantidad)
            .GreaterThanOrEqualTo(0)
            .WithMessage("La cantidad no puede ser negativa.");
    }
}

public class AsignarUbicacionCommandHandler
    : IRequestHandler<AsignarUbicacionCommand, Result<string>>
{
    private readonly IApplicationDbContext _context;

    public AsignarUbicacionCommandHandler(IApplicationDbContext context)
        => _context = context;

    public async Task<Result<string>> Handle(
        AsignarUbicacionCommand request,
        CancellationToken cancellationToken)
    {
        // 1. Verificar variante
        var variante = await _context.Variantes
            .FirstOrDefaultAsync(
                v => v.Id == request.IdVariante,
                cancellationToken);

        if (variante is null)
        {
            // Comprobar si existe pero está eliminada lógicamente.
            var varianteEliminada = await _context.Variantes
                .IgnoreQueryFilters()
                .AnyAsync(v => v.Id == request.IdVariante, cancellationToken);

            if (varianteEliminada)
                return Result<string>.Failure(
                    UbicacionErrors.VarianteDeleted(request.IdVariante));

            return Result<string>.Failure(
                UbicacionErrors.VarianteNotFound(request.IdVariante));
        }

        // 2. Verificar estantería y cargar su depósito
        var estanteria = await _context.Estanterias
            .Include(e => e.Deposito)
            .FirstOrDefaultAsync(
                e => e.Id == request.IdEstanteria,
                cancellationToken);

        if (estanteria is null)
        {
            var estanteriaEliminada = await _context.Estanterias
                .IgnoreQueryFilters()
                .AnyAsync(
                    e => e.Id == request.IdEstanteria,
                    cancellationToken);

            if (estanteriaEliminada)
                return Result<string>.Failure(
                    UbicacionErrors.EstanteriaDeleted(request.IdEstanteria));

            return Result<string>.Failure(
                UbicacionErrors.EstanteriaNotFound(request.IdEstanteria));
        }

        // 3. Verificar que el depósito esté activo
        if (!estanteria.Deposito.Activo)
        {
            return Result<string>.Failure(
                UbicacionErrors.DepositoInactive(estanteria.Deposito.Nombre));
        }

        // 4. Buscar ubicación existente
        var ubicacion = await _context.Ubicaciones
            .FirstOrDefaultAsync(u =>
                u.IdVariante == request.IdVariante &&
                u.IdEstanteria == request.IdEstanteria,
                cancellationToken);

        // 5. Crear o actualizar
        if (ubicacion is null)
        {
            ubicacion = new Ubicacion
            {
                IdVariante = request.IdVariante,
                IdEstanteria = request.IdEstanteria,
                Cantidad = request.Cantidad
            };

            _context.Ubicaciones.Add(ubicacion);
        }
        else
        {
            ubicacion.Cantidad = request.Cantidad;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Result<string>.Success(ubicacion.Id);
    }
}