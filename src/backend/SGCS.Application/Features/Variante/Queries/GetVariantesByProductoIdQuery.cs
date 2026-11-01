using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Application.Common.Models.Dtos;

namespace SGCS.Application.Features.Variantes.Queries;

public record GetVariantesByProductoIdQuery(string IdProducto) : IRequest<Result<IReadOnlyList<VarianteDto>>>;

public class GetVariantesByProductoIdQueryValidator : AbstractValidator<GetVariantesByProductoIdQuery>
{
    public GetVariantesByProductoIdQueryValidator()
    {
        RuleFor(x => x.IdProducto)
            .NotEmpty()
            .WithMessage("El ID del producto es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID del producto no debe superar los 36 caracteres.");
    }
}

public class GetVariantesByProductoIdQueryHandler : IRequestHandler<GetVariantesByProductoIdQuery, Result<IReadOnlyList<VarianteDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetVariantesByProductoIdQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<IReadOnlyList<VarianteDto>>> Handle(GetVariantesByProductoIdQuery request, CancellationToken cancellationToken)
    {
        var productoExists = await _context.Productos
            .AnyAsync(p => p.Id == request.IdProducto, cancellationToken);

        if (!productoExists)
            return Result<IReadOnlyList<VarianteDto>>.Failure(VarianteErrors.ProductoNotFound(request.IdProducto));

        var variantes = await _context.Variantes
            .AsNoTracking()
            .Where(v => v.IdProducto == request.IdProducto)
            .OrderBy(v => v.Talle != null ? v.Talle.Orden : 0)
            .ThenBy(v => v.Color != null ? v.Color.Nombre : "")
            .Select(v => new VarianteDto(
                v.Id,
                v.IdProducto,
                v.Producto != null ? v.Producto.Nombre : null,
                v.Sku,
                v.IdTalle,
                v.Talle != null ? v.Talle.Nombre : null,
                v.IdColor,
                v.Color != null ? v.Color.Nombre : null,
                v.Color != null ? v.Color.CodigoHex : null,
                v.StockMinimo
            ))
            .ToListAsync(cancellationToken);

        return Result<IReadOnlyList<VarianteDto>>.Success(variantes);
    }
}

