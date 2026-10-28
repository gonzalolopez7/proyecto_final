using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Application.Common.Models.Dtos;

namespace SGCS.Application.Features.Proveedores.Queries;

public record GetProveedorByIdQuery(string Id) : IRequest<Result<ProveedorDto>>;

public class GetProveedorByIdQueryValidator : AbstractValidator<GetProveedorByIdQuery>
{
    public GetProveedorByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Proveedor id is required.");
    }
}

public class GetProveedorByIdQueryHandler : IRequestHandler<GetProveedorByIdQuery, Result<ProveedorDto>>
{
    private readonly IApplicationDbContext _context;

    public GetProveedorByIdQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<ProveedorDto>> Handle(GetProveedorByIdQuery request, CancellationToken cancellationToken)
    {
        var proveedor = await _context.Proveedores
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (proveedor is null)
            return Result<ProveedorDto>.Failure(ProveedorErrors.NotFound(request.Id));

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
