using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.VariantesProveedores.Commands;

public record UpdateVarianteProveedorRequest(
    string CodigoProveedor,
    decimal Costo
);

public record UpdateVarianteProveedorCommand(
    string Id,
    string CodigoProveedor,
    decimal Costo
) : IRequest<Result>;

public class UpdateVarianteProveedorCommandValidator : AbstractValidator<UpdateVarianteProveedorCommand>
{
    public UpdateVarianteProveedorCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID de la relación es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID de la relación no debe superar los 36 caracteres.");

        RuleFor(x => x.CodigoProveedor)
            .NotEmpty()
            .WithMessage("El código del proveedor es obligatorio.")
            .MaximumLength(50)
            .WithMessage("El código del proveedor no debe superar los 50 caracteres.");

        RuleFor(x => x.Costo)
            .GreaterThanOrEqualTo(0)
            .WithMessage("El costo debe ser mayor o igual a 0.");
    }
}

public class UpdateVarianteProveedorCommandHandler : IRequestHandler<UpdateVarianteProveedorCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public UpdateVarianteProveedorCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result> Handle(UpdateVarianteProveedorCommand request, CancellationToken cancellationToken)
    {
        var varianteProveedor = await _context.VariantesProveedores
            .Include(vp => vp.Proveedor)
            .FirstOrDefaultAsync(vp => vp.Id == request.Id, cancellationToken);

        if (varianteProveedor is null)
            return Result.Failure(VarianteProveedorErrors.NotFound(request.Id));

        var normalizedCodigo = request.CodigoProveedor.Trim().ToUpperInvariant();

        // Si el código de proveedor cambió, verificar que no colisione con otro código del mismo proveedor
        if (varianteProveedor.CodigoProveedor != normalizedCodigo)
        {
            var existingCodigo = await _context.VariantesProveedores
                .AnyAsync(vp =>
                    vp.IdProveedor == varianteProveedor.IdProveedor &&
                    vp.CodigoProveedor == normalizedCodigo &&
                    vp.Id != request.Id,
                    cancellationToken);

            if (existingCodigo)
            {
                var proveedorNombre = varianteProveedor.Proveedor?.Nombre ?? varianteProveedor.IdProveedor;
                return Result.Failure(VarianteProveedorErrors.CodigoProveedorAlreadyExists(
                    normalizedCodigo,
                    proveedorNombre));
            }
        }

        varianteProveedor.CodigoProveedor = normalizedCodigo;
        varianteProveedor.Costo = request.Costo;

        _context.VariantesProveedores.Update(varianteProveedor);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

