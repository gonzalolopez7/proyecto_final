using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Application.Common.Models.Dtos;

namespace SGCS.Application.Features.Proveedores.Queries;

public record GetProveedoresQuery(
    int Page = 1,
    int PageSize = 10,
    string? Search = null
) : IRequest<PaginatedList<ProveedorDto>>;

public class GetProveedoresQueryValidator : AbstractValidator<GetProveedoresQuery>
{
    public GetProveedoresQueryValidator()
    {
        RuleFor(x => x.Page)
            .GreaterThanOrEqualTo(1)
            .WithMessage("La página debe ser mayor o igual a 1.");

        RuleFor(x => x.PageSize)
            .GreaterThanOrEqualTo(1)
            .WithMessage("El tamaño de página debe ser mayor o igual a 1.")
            .LessThanOrEqualTo(100)
            .WithMessage("El tamaño de página no debe superar los 100.");

        RuleFor(x => x.Search)
            .MaximumLength(100)
            .When(x => !string.IsNullOrEmpty(x.Search))
            .WithMessage("La búsqueda no debe superar los 100 caracteres.");
    }
}

public class GetProveedoresQueryHandler : IRequestHandler<GetProveedoresQuery, PaginatedList<ProveedorDto>>
{
    private readonly IApplicationDbContext _context;

    public GetProveedoresQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<PaginatedList<ProveedorDto>> Handle(GetProveedoresQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Proveedores.AsNoTracking();

        // Filtro por búsqueda textual (Nombre, Razón Social, CUIT, Email, Teléfono, Dirección)
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(p =>
                p.Nombre.ToLower().Contains(search) ||
                p.RazonSocial.ToLower().Contains(search) ||
                p.Cuit.Contains(search) ||
                (p.Email != null && p.Email.ToLower().Contains(search)) ||
                (p.Telefono != null && p.Telefono.Contains(search)) ||
                (p.Direccion != null && p.Direccion.ToLower().Contains(search))
            );
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(p => p.Nombre)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(p => new ProveedorDto(
                p.Id,
                p.Nombre,
                p.RazonSocial,
                p.Cuit,
                p.Telefono,
                p.Direccion,
                p.Email,
                p.DiasPago,
                p.SaldoInicial
            ))
            .ToListAsync(cancellationToken);

        return new PaginatedList<ProveedorDto>(items, totalCount, request.Page, request.PageSize);
    }
}
