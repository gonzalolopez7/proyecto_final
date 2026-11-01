using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.Variantes.Commands;

public record RestoreVarianteCommand(string Id) : IRequest<Result>;

public class RestoreVarianteCommandValidator : AbstractValidator<RestoreVarianteCommand>
{
    public RestoreVarianteCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID de la variante es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID de la variante no debe superar los 36 caracteres.");
    }
}

public class RestoreVarianteCommandHandler : IRequestHandler<RestoreVarianteCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public RestoreVarianteCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result> Handle(RestoreVarianteCommand request, CancellationToken cancellationToken)
    {
        var variante = await _context.Variantes
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(v => v.Id == request.Id, cancellationToken);

        if (variante is null)
            return Result.Failure(VarianteErrors.NotFound(request.Id));

        if (!variante.IsDeleted)
            return Result.Failure(VarianteErrors.NotDeleted(request.Id));

        // Verificar que no haya otra variante activa con el mismo SKU
        var activeSkuExists = await _context.Variantes
            .AnyAsync(v => v.Sku == variante.Sku && v.Id != request.Id, cancellationToken);

        if (activeSkuExists)
            return Result.Failure(VarianteErrors.SkuAlreadyExists(variante.Sku));

        // Verificar que no haya otra variante activa con la misma combinación (IdProducto, IdTalle, IdColor)
        var activeCombination = await _context.Variantes
            .Include(v => v.Producto)
            .Include(v => v.Color)
            .Include(v => v.Talle)
            .FirstOrDefaultAsync(v =>
                v.IdProducto == variante.IdProducto &&
                v.IdTalle == variante.IdTalle &&
                v.IdColor == variante.IdColor &&
                v.Id != request.Id,
                cancellationToken);

        if (activeCombination is not null)
        {
            var prodNombre = activeCombination.Producto?.Nombre ?? "Producto";
            var colorNombre = activeCombination.Color?.Nombre ?? "Color";
            var talleNombre = activeCombination.Talle?.Nombre ?? "Talle";
            return Result.Failure(VarianteErrors.CombinationAlreadyExists(prodNombre, colorNombre, talleNombre));
        }

        variante.IsDeleted = false;
        variante.DeletedAt = null;
        variante.DeletedBy = null;

        _context.Variantes.Update(variante);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

