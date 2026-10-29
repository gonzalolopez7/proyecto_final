using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Validation;
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
            .WithMessage("Nombre is required.")
            .MaximumLength(200)
            .WithMessage("Nombre must not exceed 200 characters.");

        RuleFor(x => x.RazonSocial)
            .NotEmpty()
            .WithMessage("RazonSocial is required.")
            .MaximumLength(200)
            .WithMessage("RazonSocial must not exceed 200 characters.");

        RuleFor(x => x.Cuit)
            .NotEmpty()
            .WithMessage("CUIT is required.")
            .Length(11)
            .WithMessage("El CUIT debe tener exactamente 11 caracteres.")
            .Matches(@"^\d{11}$")
            .WithMessage("El CUIT debe contener únicamente números (sin guiones).")
            .Must(CuitHelper.IsValidCuit)
            .WithMessage("El CUIT ingresado no es válido.");
            ;

        RuleFor(x => x.Telefono)
            .Length(10)
            .When(x => !string.IsNullOrEmpty(x.Telefono))
            .WithMessage("Telefono must be 10 digits long.")
            .Matches("^[0-9]*$")
            .When(x => !string.IsNullOrEmpty(x.Telefono))
            .WithMessage("Telefono must contain only digits.");

        RuleFor(x => x.Email)
            .EmailAddress()
            .When(x => !string.IsNullOrEmpty(x.Email))
            .WithMessage("Email must be valid.");

        RuleFor(x => x.DiasPago)
            .GreaterThanOrEqualTo(0)
            .WithMessage("DiasPago must be greater than or equal to 0.");

        RuleFor(x => x.SaldoInicial)
            .GreaterThanOrEqualTo(0)
            .WithMessage("SaldoInicial must be greater than or equal to 0.");
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
