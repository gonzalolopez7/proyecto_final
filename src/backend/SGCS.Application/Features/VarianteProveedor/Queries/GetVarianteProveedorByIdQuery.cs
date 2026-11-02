using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Application.Common.Models.Dtos;

namespace SGCS.Application.Features.VariantesProveedores.Queries;

public record GetVarianteProveedorByIdQuery(string Id) : IRequest<Result<VarianteProveedorDto>>;

public class GetVarianteProveedorByIdQueryValidator : AbstractValidator<GetVarianteProveedorByIdQuery>
{
    public GetVarianteProveedorByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID de la relación es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID de la relación no debe superar los 36 caracteres.");
    }
}

public class GetVarianteProveedorByIdQueryHandler : IRequestHandler<GetVarianteProveedorByIdQuery, Result<VarianteProveedorDto>>
{
    private readonly IApplicationDbContext _context;

    public GetVarianteProveedorByIdQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<VarianteProveedorDto>> Handle(GetVarianteProveedorByIdQuery request, CancellationToken cancellationToken)
    {
        var dto = await _context.VariantesProveedores
            .AsNoTracking()
            .Where(vp => vp.Id == request.Id)
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
            .FirstOrDefaultAsync(cancellationToken);

        if (dto is null)
            return Result<VarianteProveedorDto>.Failure(VarianteProveedorErrors.NotFound(request.Id));

        return Result<VarianteProveedorDto>.Success(dto);
    }
}

