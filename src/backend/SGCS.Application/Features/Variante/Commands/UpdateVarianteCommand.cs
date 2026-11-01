using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.Variantes.Commands;

public record UpdateVarianteRequest(
    string Sku,
    string IdTalle,
    string IdColor,
    int StockMinimo
);

public record UpdateVarianteCommand(
    string Id,
    string Sku,
    string IdTalle,
    string IdColor,
    int StockMinimo
) : IRequest<Result>;

public class UpdateVarianteCommandValidator : AbstractValidator<UpdateVarianteCommand>
{
    public UpdateVarianteCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID de la variante es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID de la variante no debe superar los 36 caracteres.");

        RuleFor(x => x.Sku)
            .NotEmpty()
            .WithMessage("El SKU es obligatorio.")
            .MaximumLength(50)
            .WithMessage("El SKU no debe superar los 50 caracteres.");

        RuleFor(x => x.IdTalle)
            .NotEmpty()
            .WithMessage("El talle es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID de talle no debe superar los 36 caracteres.");

        RuleFor(x => x.IdColor)
            .NotEmpty()
            .WithMessage("El color es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID de color no debe superar los 36 caracteres.");

        RuleFor(x => x.StockMinimo)
            .GreaterThanOrEqualTo(0)
            .WithMessage("El stock mínimo debe ser mayor o igual a 0.");
    }
}

public class UpdateVarianteCommandHandler : IRequestHandler<UpdateVarianteCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public UpdateVarianteCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result> Handle(UpdateVarianteCommand request, CancellationToken cancellationToken)
    {
        var variante = await _context.Variantes
            .FirstOrDefaultAsync(v => v.Id == request.Id, cancellationToken);

        if (variante is null)
            return Result.Failure(VarianteErrors.NotFound(request.Id));

        var normalizedSku = request.Sku.Trim().ToUpperInvariant();

        // 1. Si el SKU cambió, verificar que no colisione con otro
        if (variante.Sku != normalizedSku)
        {
            var existingSku = await _context.Variantes
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(v => v.Sku == normalizedSku && v.Id != request.Id, cancellationToken);

            if (existingSku is not null)
            {
                if (existingSku.IsDeleted)
                    return Result.Failure(VarianteErrors.SoftDeletedSku(normalizedSku, existingSku.Id));

                return Result.Failure(VarianteErrors.SkuAlreadyExists(normalizedSku));
            }
        }

        // 2. Verificar existencia del Producto al que pertenece la variante
        var producto = await _context.Productos
            .Include(p => p.EscalaTalle)
            .FirstOrDefaultAsync(p => p.Id == variante.IdProducto, cancellationToken);

        if (producto is null)
            return Result.Failure(VarianteErrors.ProductoNotFound(variante.IdProducto));

        // 3. Verificar existencia del Color
        var color = await _context.Colores
            .FirstOrDefaultAsync(c => c.Id == request.IdColor, cancellationToken);

        if (color is null)
            return Result.Failure(VarianteErrors.ColorNotFound(request.IdColor));

        // 4. Verificar existencia del Talle
        var talle = await _context.Talles
            .Include(t => t.EscalaTalle)
            .FirstOrDefaultAsync(t => t.Id == request.IdTalle, cancellationToken);

        if (talle is null)
            return Result.Failure(VarianteErrors.TalleNotFound(request.IdTalle));

        // 5. Verificar que el talle pertenezca a la escala del producto
        if (talle.IdEscalaTalle != producto.IdEscalaTalle)
        {
            var escalaNombre = producto.EscalaTalle?.Nombre ?? "asignada";
            return Result.Failure(VarianteErrors.TalleNotBelongToProductoEscala(
                talle.Nombre,
                producto.Nombre,
                escalaNombre));
        }

        // 6. Si cambió el talle o el color, verificar que la nueva combinación no esté repetida
        if (variante.IdTalle != request.IdTalle || variante.IdColor != request.IdColor)
        {
            var existingCombination = await _context.Variantes
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(v =>
                    v.IdProducto == variante.IdProducto &&
                    v.IdTalle == request.IdTalle &&
                    v.IdColor == request.IdColor &&
                    v.Id != request.Id,
                    cancellationToken);

            if (existingCombination is not null)
            {
                if (existingCombination.IsDeleted)
                    return Result.Failure(VarianteErrors.SoftDeletedCombination(
                        existingCombination.Id,
                        color.Nombre,
                        talle.Nombre));

                return Result.Failure(VarianteErrors.CombinationAlreadyExists(
                    producto.Nombre,
                    color.Nombre,
                    talle.Nombre));
            }
        }

        // 7. Actualizar campos
        variante.Sku = normalizedSku;
        variante.IdTalle = request.IdTalle;
        variante.IdColor = request.IdColor;
        variante.StockMinimo = request.StockMinimo;

        _context.Variantes.Update(variante);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

