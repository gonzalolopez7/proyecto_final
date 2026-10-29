using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Domain.Entities;

namespace SGCS.Application.Features.Proveedores.Commands;

public record CreateProveedorCommand(
    string Nombre,
    string RazonSocial,
    string Cuit,
    string? Telefono,
    string? Direccion,
    string? Email,
    int DiasPago,
    decimal SaldoInicial
) : IRequest<Result<string>>;

public class CreateProveedorCommandValidator : AbstractValidator<CreateProveedorCommand>
{
    public CreateProveedorCommandValidator()
    {
        RuleFor(x => x.Nombre)
            .NotEmpty()
            .WithMessage("El nombre es obligatorio.")
            .MaximumLength(200)
            .WithMessage("El nombre no debe superar los 200 caracteres.");

        RuleFor(x => x.RazonSocial)
            .NotEmpty()
            .WithMessage("La razón social es obligatoria.")
            .MaximumLength(200)
            .WithMessage("La razón social no debe superar los 200 caracteres.");

        RuleFor(x => x.Cuit)
            .NotEmpty()
            .WithMessage("El CUIT es obligatorio.")
            .MaximumLength(20)
            .WithMessage("El CUIT no debe superar los 20 caracteres.");

        RuleFor(x => x.Telefono)
            .Length(10)
            .When(x => !string.IsNullOrEmpty(x.Telefono))
            .WithMessage("El teléfono debe tener 10 dígitos.")
            .Matches("^[0-9]*$")
            .When(x => !string.IsNullOrEmpty(x.Telefono))
            .WithMessage("El teléfono solo debe contener dígitos.");

        RuleFor(x => x.Email)
            .EmailAddress()
            .When(x => !string.IsNullOrEmpty(x.Email))
            .WithMessage("El formato del correo electrónico no es válido.");

        RuleFor(x => x.DiasPago)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Los días de pago deben ser mayores o iguales a 0.");

        RuleFor(x => x.SaldoInicial)
            .GreaterThanOrEqualTo(0)
            .WithMessage("El saldo inicial debe ser mayor o igual a 0.");
    }
}

public class CreateProveedorCommandHandler : IRequestHandler<CreateProveedorCommand, Result<string>>
{
    private readonly IApplicationDbContext _context;

    public CreateProveedorCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<string>> Handle(CreateProveedorCommand request, CancellationToken cancellationToken)
    {
        var existingProveedor = await _context.Proveedores
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.Cuit == request.Cuit, cancellationToken);

        if (existingProveedor is not null)
        {
            if (existingProveedor.IsDeleted)
            {
                return Result<string>.Failure(ProveedorErrors.SoftDeletedCuit(
                    existingProveedor.Cuit,
                    existingProveedor.Id,
                    existingProveedor.Nombre));
            }

            return Result<string>.Failure(ProveedorErrors.CuitAlreadyExists(request.Cuit));
        }

        var proveedor = new Proveedor
        {
            Nombre = request.Nombre,
            RazonSocial = request.RazonSocial,
            Cuit = request.Cuit,
            Telefono = request.Telefono,
            Direccion = request.Direccion,
            Email = request.Email,
            DiasPago = request.DiasPago,
            SaldoInicial = request.SaldoInicial
        };

        _context.Proveedores.Add(proveedor);

        await _context.SaveChangesAsync(cancellationToken);

        return Result<string>.Success(proveedor.Id);
    }
}
