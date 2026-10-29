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
            .WithMessage("El ID del proveedor es obligatorio.");
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
            .Where(p => p.Id == request.Id)
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
            .FirstOrDefaultAsync(cancellationToken);

        if (proveedor is null)
            return Result<ProveedorDto>.Failure(ProveedorErrors.NotFound(request.Id));

        return Result<ProveedorDto>.Success(proveedor);
    }
}
