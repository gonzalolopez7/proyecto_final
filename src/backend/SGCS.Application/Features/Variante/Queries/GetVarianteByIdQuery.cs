using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Application.Common.Models.Dtos;

namespace SGCS.Application.Features.Variantes.Queries;

public record GetVarianteByIdQuery(string Id) : IRequest<Result<VarianteDto>>;

public class GetVarianteByIdQueryValidator : AbstractValidator<GetVarianteByIdQuery>
{
    public GetVarianteByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID de la variante es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID de la variante no debe superar los 36 caracteres.");
    }
}

public class GetVarianteByIdQueryHandler : IRequestHandler<GetVarianteByIdQuery, Result<VarianteDto>>
{
    private readonly IApplicationDbContext _context;

    public GetVarianteByIdQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<VarianteDto>> Handle(GetVarianteByIdQuery request, CancellationToken cancellationToken)
    {
        var variante = await _context.Variantes
            .AsNoTracking()
            .Where(v => v.Id == request.Id)
            .Select(v => new VarianteDto(
                v.Id,
                v.IdProducto,
                v.Producto != null ? v.Producto.Nombre : null,
                v.Sku,
                v.IdTalle,
                v.Talle != null ? v.Talle.Nombre : null,
                v.IdColor,
                v.Color != null ? v.Color.Nombre : null,
                v.Color != null ? v.Color.CodigoHex : null,
                v.StockMinimo
            ))
            .FirstOrDefaultAsync(cancellationToken);

        if (variante is null)
            return Result<VarianteDto>.Failure(VarianteErrors.NotFound(request.Id));

        return Result<VarianteDto>.Success(variante);
    }
}

