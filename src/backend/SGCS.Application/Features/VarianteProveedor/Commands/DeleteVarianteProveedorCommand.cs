using FluentValidation;
using MediatR;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.VariantesProveedores.Commands;

public record DeleteVarianteProveedorCommand(string Id) : IRequest<Result>;

public class DeleteVarianteProveedorCommandValidator : AbstractValidator<DeleteVarianteProveedorCommand>
{
    public DeleteVarianteProveedorCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID de la relación es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID de la relación no debe superar los 36 caracteres.");
    }
}

public class DeleteVarianteProveedorCommandHandler : IRequestHandler<DeleteVarianteProveedorCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public DeleteVarianteProveedorCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result> Handle(DeleteVarianteProveedorCommand request, CancellationToken cancellationToken)
    {
        var varianteProveedor = await _context.VariantesProveedores.FindAsync([request.Id], cancellationToken);

        if (varianteProveedor is null)
            return Result.Failure(VarianteProveedorErrors.NotFound(request.Id));

        _context.VariantesProveedores.Remove(varianteProveedor);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

