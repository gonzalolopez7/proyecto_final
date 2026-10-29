using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Application.Common.Models.Dtos;

namespace SGCS.Application.Features.Productos.Queries;

public record GetProductosQuery(
    int Page = 1,
    int PageSize = 10,
    string? Search = null,
    string? IdCategoria = null,
    string? IdGenero = null,
    string? IdTemporada = null,
    string? IdFit = null,
    string? IdMaterial = null
) : IRequest<PaginatedList<ProductoDto>>;

public class GetProductosQueryValidator : AbstractValidator<GetProductosQuery>
{
    public GetProductosQueryValidator()
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

public class GetProductosQueryHandler : IRequestHandler<GetProductosQuery, PaginatedList<ProductoDto>>
{
    private readonly IApplicationDbContext _context;

    public GetProductosQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<PaginatedList<ProductoDto>> Handle(GetProductosQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Productos.AsNoTracking();

        // Filtro por búsqueda textual (Nombre o Descripción)
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(p => p.Nombre.ToLower().Contains(search) || p.Descripcion.ToLower().Contains(search));
        }

        // Filtros por relaciones
        if (!string.IsNullOrEmpty(request.IdCategoria))
            query = query.Where(p => p.IdCategoria == request.IdCategoria);

        if (!string.IsNullOrEmpty(request.IdGenero))
            query = query.Where(p => p.IdGenero == request.IdGenero);

        if (!string.IsNullOrEmpty(request.IdTemporada))
            query = query.Where(p => p.IdTemporada == request.IdTemporada);

        if (!string.IsNullOrEmpty(request.IdFit))
            query = query.Where(p => p.IdFit == request.IdFit);

        if (!string.IsNullOrEmpty(request.IdMaterial))
            query = query.Where(p => p.IdMaterial == request.IdMaterial);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(p => p.Nombre)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(p => new ProductoDto(
                p.Id,
                p.Nombre,
                p.Descripcion,
                p.IdCategoria,
                p.Categoria != null ? p.Categoria.Nombre : null,
                p.IdGenero,
                p.Genero != null ? p.Genero.Nombre : null,
                p.IdTemporada,
                p.Temporada != null ? p.Temporada.Nombre : null,
                p.IdFit,
                p.Fit != null ? p.Fit.Nombre : null,
                p.IdMaterial,
                p.Material != null ? p.Material.Nombre : null
            ))
            .ToListAsync(cancellationToken);

        return new PaginatedList<ProductoDto>(items, totalCount, request.Page, request.PageSize);
    }
}
