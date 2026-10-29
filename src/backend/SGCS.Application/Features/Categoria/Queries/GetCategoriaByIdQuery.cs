using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Application.Common.Models.Dtos;

namespace SGCS.Application.Features.Categorias.Queries;

public record GetCategoriaByIdQuery(string Id) : IRequest<Result<CategoriaDto>>;

public class GetCategoriaByIdQueryValidator : AbstractValidator<GetCategoriaByIdQuery>
{
    public GetCategoriaByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID de la categoría es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID de la categoría no debe superar los 36 caracteres.");
    }
}

public class GetCategoriaByIdQueryHandler : IRequestHandler<GetCategoriaByIdQuery, Result<CategoriaDto>>
{
    private readonly IApplicationDbContext _context;

    public GetCategoriaByIdQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<CategoriaDto>> Handle(GetCategoriaByIdQuery request, CancellationToken cancellationToken)
    {
        var categoria = await _context.Categorias
            .AsNoTracking()
            .Where(c => c.Id == request.Id)
            .Select(c => new CategoriaDto(
                c.Id,
                c.Nombre,
                c.IdPadre,
                c.Padre != null ? c.Padre.Nombre : null,
                _context.Productos.Any(p => p.IdCategoria == c.Id)
            ))
            .FirstOrDefaultAsync(cancellationToken);

        if (categoria is null)
            return Result<CategoriaDto>.Failure(CategoriaErrors.NotFound(request.Id));

        return Result<CategoriaDto>.Success(categoria);
    }
}
