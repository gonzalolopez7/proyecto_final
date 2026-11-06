using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Application.Common.Models.Dtos;

namespace SGCS.Application.Features.Ubicaciones.Queries;

public record GetUbicacionByIdQuery(string Id)
    : IRequest<Result<UbicacionDto>>;

public class GetUbicacionByIdQueryValidator
    : AbstractValidator<GetUbicacionByIdQuery>
{
    public GetUbicacionByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID de la ubicación es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID de la ubicación no debe superar los 36 caracteres.");
    }
}

public class GetUbicacionByIdQueryHandler
    : IRequestHandler<GetUbicacionByIdQuery, Result<UbicacionDto>>
{
    private readonly IApplicationDbContext _context;

    public GetUbicacionByIdQueryHandler(IApplicationDbContext context)
        => _context = context;

    public async Task<Result<UbicacionDto>> Handle(
        GetUbicacionByIdQuery request,
        CancellationToken cancellationToken)
    {
        var dto = await _context.Ubicaciones
            .AsNoTracking()
            .Where(u => u.Id == request.Id)
            .Select(u => new UbicacionDto(
                u.Id,
                u.IdVariante,
                u.Variante != null ? u.Variante.Sku : string.Empty,
                u.Variante != null && u.Variante.Producto != null ? u.Variante.Producto.Nombre : null,
                u.Variante != null && u.Variante.Talle != null ? u.Variante.Talle.Nombre : null,
                u.Variante != null && u.Variante.Color != null ? u.Variante.Color.Nombre : null,
                u.Variante != null && u.Variante.Color != null ? u.Variante.Color.CodigoHex : null,
                u.IdEstanteria,
                u.Estanteria != null ? u.Estanteria.Nombre : string.Empty,
                u.Estanteria != null ? u.Estanteria.IdDeposito : string.Empty,
                u.Estanteria != null && u.Estanteria.Deposito != null ? u.Estanteria.Deposito.Nombre : string.Empty,
                u.Cantidad
            ))
            .FirstOrDefaultAsync(cancellationToken);

        if (dto is null)
            return Result<UbicacionDto>.Failure(
                UbicacionErrors.NotFound(request.Id));

        return Result<UbicacionDto>.Success(dto);
    }
}

