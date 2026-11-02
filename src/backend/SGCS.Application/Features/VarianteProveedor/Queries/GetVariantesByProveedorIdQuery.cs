using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Application.Common.Models.Dtos;

namespace SGCS.Application.Features.VariantesProveedores.Queries;

public record GetVariantesByProveedorIdQuery(string IdProveedor) : IRequest<Result<IReadOnlyList<VarianteProveedorDto>>>;

public class GetVariantesByProveedorIdQueryValidator : AbstractValidator<GetVariantesByProveedorIdQuery>
{
    public GetVariantesByProveedorIdQueryValidator()
    {
        RuleFor(x => x.IdProveedor)
            .NotEmpty()
            .WithMessage("El ID del proveedor es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID del proveedor no debe superar los 36 caracteres.");
    }
}

public class GetVariantesByProveedorIdQueryHandler : IRequestHandler<GetVariantesByProveedorIdQuery, Result<IReadOnlyList<VarianteProveedorDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetVariantesByProveedorIdQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<IReadOnlyList<VarianteProveedorDto>>> Handle(GetVariantesByProveedorIdQuery request, CancellationToken cancellationToken)
    {
        var proveedorExists = await _context.Proveedores
            .AnyAsync(p => p.Id == request.IdProveedor, cancellationToken);

        if (!proveedorExists)
            return Result<IReadOnlyList<VarianteProveedorDto>>.Failure(VarianteProveedorErrors.ProveedorNotFound(request.IdProveedor));

        var variantes = await _context.VariantesProveedores
            .AsNoTracking()
            .Where(vp => vp.IdProveedor == request.IdProveedor)
            .OrderBy(vp => vp.Variante != null && vp.Variante.Producto != null ? vp.Variante.Producto.Nombre : string.Empty)
            .ThenBy(vp => vp.Variante != null && vp.Variante.Talle != null ? vp.Variante.Talle.Orden : 0)
            .ThenBy(vp => vp.Variante != null && vp.Variante.Color != null ? vp.Variante.Color.Nombre : string.Empty)
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

        return Result<IReadOnlyList<VarianteProveedorDto>>.Success(variantes);
    }
}

