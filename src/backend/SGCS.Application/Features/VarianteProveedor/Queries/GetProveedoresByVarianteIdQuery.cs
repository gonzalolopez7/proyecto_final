using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Application.Common.Models.Dtos;

namespace SGCS.Application.Features.VariantesProveedores.Queries;

public record GetProveedoresByVarianteIdQuery(string IdVariante) : IRequest<Result<IReadOnlyList<VarianteProveedorDto>>>;

public class GetProveedoresByVarianteIdQueryValidator : AbstractValidator<GetProveedoresByVarianteIdQuery>
{
    public GetProveedoresByVarianteIdQueryValidator()
    {
        RuleFor(x => x.IdVariante)
            .NotEmpty()
            .WithMessage("El ID de la variante es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID de la variante no debe superar los 36 caracteres.");
    }
}

public class GetProveedoresByVarianteIdQueryHandler : IRequestHandler<GetProveedoresByVarianteIdQuery, Result<IReadOnlyList<VarianteProveedorDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetProveedoresByVarianteIdQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<IReadOnlyList<VarianteProveedorDto>>> Handle(GetProveedoresByVarianteIdQuery request, CancellationToken cancellationToken)
    {
        var varianteExists = await _context.Variantes
            .AnyAsync(v => v.Id == request.IdVariante, cancellationToken);

        if (!varianteExists)
            return Result<IReadOnlyList<VarianteProveedorDto>>.Failure(VarianteProveedorErrors.VarianteNotFound(request.IdVariante));

        var proveedores = await _context.VariantesProveedores
            .AsNoTracking()
            .Where(vp => vp.IdVariante == request.IdVariante)
            .OrderBy(vp => vp.Costo)
            .ThenBy(vp => vp.Proveedor != null ? vp.Proveedor.Nombre : string.Empty)
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

        return Result<IReadOnlyList<VarianteProveedorDto>>.Success(proveedores);
    }
}

