using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Domain.Entities;

namespace SGCS.Application.Features.VariantesProveedores.Commands;

public record CreateVarianteProveedorCommand(
    string IdVariante,
    string IdProveedor,
    string CodigoProveedor,
    decimal Costo
) : IRequest<Result<string>>;

public class CreateVarianteProveedorCommandValidator : AbstractValidator<CreateVarianteProveedorCommand>
{
    public CreateVarianteProveedorCommandValidator()
    {
        RuleFor(x => x.IdVariante)
            .NotEmpty()
            .WithMessage("El ID de la variante es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID de la variante no debe superar los 36 caracteres.");

        RuleFor(x => x.IdProveedor)
            .NotEmpty()
            .WithMessage("El ID del proveedor es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID del proveedor no debe superar los 36 caracteres.");

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

public class CreateVarianteProveedorCommandHandler : IRequestHandler<CreateVarianteProveedorCommand, Result<string>>
{
    private readonly IApplicationDbContext _context;

    public CreateVarianteProveedorCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<string>> Handle(CreateVarianteProveedorCommand request, CancellationToken cancellationToken)
    {
        var normalizedCodigo = request.CodigoProveedor.Trim().ToUpperInvariant();

        // 1. Verificar existencia de la Variante
        var variante = await _context.Variantes
            .FirstOrDefaultAsync(v => v.Id == request.IdVariante, cancellationToken);

        if (variante is null)
            return Result<string>.Failure(VarianteProveedorErrors.VarianteNotFound(request.IdVariante));

        // 2. Verificar existencia del Proveedor
        var proveedor = await _context.Proveedores
            .FirstOrDefaultAsync(p => p.Id == request.IdProveedor, cancellationToken);

        if (proveedor is null)
            return Result<string>.Failure(VarianteProveedorErrors.ProveedorNotFound(request.IdProveedor));

        // 3. Verificar que no exista ya la relación (IdVariante, IdProveedor)
        var existingRelation = await _context.VariantesProveedores
            .AnyAsync(vp =>
                vp.IdVariante == request.IdVariante &&
                vp.IdProveedor == request.IdProveedor,
                cancellationToken);

        if (existingRelation)
        {
            return Result<string>.Failure(VarianteProveedorErrors.RelationAlreadyExists(
                variante.Sku,
                proveedor.Nombre));
        }

        // 4. Verificar que ese proveedor no tenga ya asignado el mismo CodigoProveedor en otra variante
        var existingCodigo = await _context.VariantesProveedores
            .AnyAsync(vp =>
                vp.IdProveedor == request.IdProveedor &&
                vp.CodigoProveedor == normalizedCodigo,
                cancellationToken);

        if (existingCodigo)
        {
            return Result<string>.Failure(VarianteProveedorErrors.CodigoProveedorAlreadyExists(
                normalizedCodigo,
                proveedor.Nombre));
        }

        // 5. Crear la entidad VarianteProveedor
        var varianteProveedor = new VarianteProveedor
        {
            IdVariante = request.IdVariante,
            IdProveedor = request.IdProveedor,
            CodigoProveedor = normalizedCodigo,
            Costo = request.Costo
        };

        _context.VariantesProveedores.Add(varianteProveedor);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<string>.Success(varianteProveedor.Id);
    }
}

