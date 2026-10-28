using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Application.Common.Models.Dtos;

namespace SGCS.Application.Features.Proveedores.Queries;

public record GetProveedorByCuitQuery(string Cuit) : IRequest<Result<ProveedorDto>>;

public class GetProveedorByCuitQueryValidator : AbstractValidator<GetProveedorByCuitQuery>
{
    public GetProveedorByCuitQueryValidator()
    {
        RuleFor(x => x.Cuit)
            .NotEmpty()
            .WithMessage("CUIT is required.");
    }
}

public class GetProveedorByCuitQueryHandler : IRequestHandler<GetProveedorByCuitQuery, Result<ProveedorDto>>
{
    private readonly IApplicationDbContext _context;

    public GetProveedorByCuitQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<ProveedorDto>> Handle(GetProveedorByCuitQuery request, CancellationToken cancellationToken)
    {
        var proveedor = await _context.Proveedores
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Cuit == request.Cuit, cancellationToken);

        if (proveedor is null)
            return Result<ProveedorDto>.Failure(ProveedorErrors.CuitNotFound(request.Cuit));

        return Result<ProveedorDto>.Success(new ProveedorDto(
            proveedor.Id,
            proveedor.Nombre,
            proveedor.RazonSocial,
            proveedor.Cuit,
            proveedor.Telefono,
            proveedor.Direccion,
            proveedor.Email,
            proveedor.DiasPago,
            proveedor.SaldoInicial
        ));
    }
}
