using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Domain.Entities;

namespace SGCS.Application.Features.Variantes.Commands;

public record CreateVarianteCommand(
    string IdProducto,
    string Sku,
    string IdTalle,
    string IdColor,
    int StockMinimo
) : IRequest<Result<string>>;

public class CreateVarianteCommandValidator : AbstractValidator<CreateVarianteCommand>
{
    public CreateVarianteCommandValidator()
    {
        RuleFor(x => x.IdProducto)
            .NotEmpty()
            .WithMessage("El ID de producto es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID de producto no debe superar los 36 caracteres.");

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

public class CreateVarianteCommandHandler : IRequestHandler<CreateVarianteCommand, Result<string>>
{
    private readonly IApplicationDbContext _context;

    public CreateVarianteCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<string>> Handle(CreateVarianteCommand request, CancellationToken cancellationToken)
    {
        var normalizedSku = request.Sku.Trim().ToUpperInvariant();

        // 1. Verificar unicidad de SKU (incluyendo soft-deleted)
        var existingSku = await _context.Variantes
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(v => v.Sku == normalizedSku, cancellationToken);

        if (existingSku is not null)
        {
            if (existingSku.IsDeleted)
                return Result<string>.Failure(VarianteErrors.SoftDeletedSku(normalizedSku, existingSku.Id));

            return Result<string>.Failure(VarianteErrors.SkuAlreadyExists(normalizedSku));
        }

        // 2. Verificar existencia del Producto
        var producto = await _context.Productos
            .Include(p => p.EscalaTalle)
            .FirstOrDefaultAsync(p => p.Id == request.IdProducto, cancellationToken);

        if (producto is null)
            return Result<string>.Failure(VarianteErrors.ProductoNotFound(request.IdProducto));

        // 3. Verificar existencia del Color
        var color = await _context.Colores
            .FirstOrDefaultAsync(c => c.Id == request.IdColor, cancellationToken);

        if (color is null)
            return Result<string>.Failure(VarianteErrors.ColorNotFound(request.IdColor));

        // 4. Verificar existencia del Talle
        var talle = await _context.Talles
            .Include(t => t.EscalaTalle)
            .FirstOrDefaultAsync(t => t.Id == request.IdTalle, cancellationToken);

        if (talle is null)
            return Result<string>.Failure(VarianteErrors.TalleNotFound(request.IdTalle));

        // 5. Verificar que el talle pertenezca a la escala del producto
        if (talle.IdEscalaTalle != producto.IdEscalaTalle)
        {
            var escalaNombre = producto.EscalaTalle?.Nombre ?? "asignada";
            return Result<string>.Failure(VarianteErrors.TalleNotBelongToProductoEscala(
                talle.Nombre,
                producto.Nombre,
                escalaNombre));
        }

        // 6. Verificar que no exista otra variante con la misma combinación (IdProducto, IdTalle, IdColor)
        var existingCombination = await _context.Variantes
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(v =>
                v.IdProducto == request.IdProducto &&
                v.IdTalle == request.IdTalle &&
                v.IdColor == request.IdColor,
                cancellationToken);

        if (existingCombination is not null)
        {
            if (existingCombination.IsDeleted)
                return Result<string>.Failure(VarianteErrors.SoftDeletedCombination(
                    existingCombination.Id,
                    color.Nombre,
                    talle.Nombre));

            return Result<string>.Failure(VarianteErrors.CombinationAlreadyExists(
                producto.Nombre,
                color.Nombre,
                talle.Nombre));
        }

        // 7. Crear la entidad Variante
        var variante = new Variante
        {
            IdProducto = request.IdProducto,
            Sku = normalizedSku,
            IdTalle = request.IdTalle,
            IdColor = request.IdColor,
            StockMinimo = request.StockMinimo
        };

        _context.Variantes.Add(variante);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<string>.Success(variante.Id);
    }
}

