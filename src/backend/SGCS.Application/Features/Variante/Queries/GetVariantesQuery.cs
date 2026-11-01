using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Application.Common.Models.Dtos;

namespace SGCS.Application.Features.Variantes.Queries;

public record GetVariantesQuery(
    int Page = 1,
    int PageSize = 10,
    string? Search = null,
    string? IdProducto = null,
    string? IdColor = null,
    string? IdTalle = null
) : IRequest<PaginatedList<VarianteDto>>;

public class GetVariantesQueryValidator : AbstractValidator<GetVariantesQuery>
{
    public GetVariantesQueryValidator()
    {
        RuleFor(x => x.Page)
            .GreaterThanOrEqualTo(1)
            .WithMessage("La página debe ser mayor o igual a 1.");

        RuleFor(x => x.PageSize)
            .GreaterThanOrEqualTo(1)
            .WithMessage("El tamaño de página debe ser mayor o igual a 1.")
            .LessThanOrEqualTo(100)
            .WithMessage("El tamaño de página no debe superar los 100.");
    }
}

public class GetVariantesQueryHandler : IRequestHandler<GetVariantesQuery, PaginatedList<VarianteDto>>
{
    private readonly IApplicationDbContext _context;

    public GetVariantesQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<PaginatedList<VarianteDto>> Handle(GetVariantesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Variantes.AsNoTracking();

        // Filtro por búsqueda textual (SKU o Nombre de Producto)
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(v =>
                v.Sku.ToLower().Contains(search) ||
                (v.Producto != null && v.Producto.Nombre.ToLower().Contains(search)));
        }

        // Filtros por relaciones
        if (!string.IsNullOrEmpty(request.IdProducto))
            query = query.Where(v => v.IdProducto == request.IdProducto);

        if (!string.IsNullOrEmpty(request.IdColor))
            query = query.Where(v => v.IdColor == request.IdColor);

        if (!string.IsNullOrEmpty(request.IdTalle))
            query = query.Where(v => v.IdTalle == request.IdTalle);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(v => v.Sku)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
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

        return new PaginatedList<VarianteDto>(items, totalCount, request.Page, request.PageSize);
    }
}

