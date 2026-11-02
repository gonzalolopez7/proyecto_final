using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Application.Common.Models.Dtos;

namespace SGCS.Application.Features.VariantesProveedores.Queries;

public record GetVariantesProveedoresQuery(
    int Page = 1,
    int PageSize = 10,
    string? Search = null,
    string? IdProveedor = null,
    string? IdVariante = null,
    string? IdProducto = null
) : IRequest<PaginatedList<VarianteProveedorDto>>;

public class GetVariantesProveedoresQueryValidator : AbstractValidator<GetVariantesProveedoresQuery>
{
    public GetVariantesProveedoresQueryValidator()
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

public class GetVariantesProveedoresQueryHandler : IRequestHandler<GetVariantesProveedoresQuery, PaginatedList<VarianteProveedorDto>>
{
    private readonly IApplicationDbContext _context;

    public GetVariantesProveedoresQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<PaginatedList<VarianteProveedorDto>> Handle(GetVariantesProveedoresQuery request, CancellationToken cancellationToken)
    {
        var query = _context.VariantesProveedores.AsNoTracking();

        // Filtro por búsqueda textual (CodigoProveedor, SKU, Nombre de Producto o Nombre de Proveedor)
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(vp =>
                vp.CodigoProveedor.ToLower().Contains(search) ||
                (vp.Variante != null && vp.Variante.Sku.ToLower().Contains(search)) ||
                (vp.Variante != null && vp.Variante.Producto != null && vp.Variante.Producto.Nombre.ToLower().Contains(search)) ||
                (vp.Proveedor != null && vp.Proveedor.Nombre.ToLower().Contains(search)));
        }

        // Filtros por relaciones
        if (!string.IsNullOrEmpty(request.IdProveedor))
            query = query.Where(vp => vp.IdProveedor == request.IdProveedor);

        if (!string.IsNullOrEmpty(request.IdVariante))
            query = query.Where(vp => vp.IdVariante == request.IdVariante);

        if (!string.IsNullOrEmpty(request.IdProducto))
            query = query.Where(vp => vp.Variante != null && vp.Variante.IdProducto == request.IdProducto);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(vp => vp.Variante != null ? vp.Variante.Sku : string.Empty)
            .ThenBy(vp => vp.Costo)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(vp => new VarianteProveedorDto(
                vp.Id,
                vp.IdVariante,
                vp.Variante != null ? vp.Variante.Sku : string.Empty,
                vp.Variante != null && vp.Variante.Producto != null ? vp.Variante.Producto.Nombre : null,
                vp.Variante != null && vp.Variante.Talle != null ? vp.Variante.Talle.Nombre : null,
                vp.Variante != null && vp.Variante.Color != null ? vp.Variante.Color.Nombre : null,
                vp.Variante != null && vp.Variante.Color != null ? vp.Variante.Color.CodigoHex : null,
                vp.IdProveedor,
                vp.Proveedor != null ? vp.Proveedor.Nombre : null,
                vp.Proveedor != null ? vp.Proveedor.RazonSocial : null,
                vp.CodigoProveedor,
                vp.Costo
            ))
            .ToListAsync(cancellationToken);

        return new PaginatedList<VarianteProveedorDto>(items, totalCount, request.Page, request.PageSize);
    }
}

