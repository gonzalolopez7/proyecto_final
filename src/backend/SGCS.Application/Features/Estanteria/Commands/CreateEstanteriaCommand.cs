
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Domain.Entities;

namespace SGCS.Application.Features.Estanterias.Commands;

public record CreateEstanteriaCommand(
    string IdDeposito,
    string Nombre,
    string? Descripcion
) : IRequest<Result<string>>;

public class CreateEstanteriaCommandValidator
    : AbstractValidator<CreateEstanteriaCommand>
{
    public CreateEstanteriaCommandValidator()
    {
        RuleFor(x => x.IdDeposito)
            .NotEmpty()
            .MaximumLength(36);

        RuleFor(x => x.Nombre)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.Descripcion)
            .MaximumLength(500);
    }
}

public class CreateEstanteriaCommandHandler
    : IRequestHandler<CreateEstanteriaCommand, Result<string>>
{
    private readonly IApplicationDbContext _context;

    public CreateEstanteriaCommandHandler(IApplicationDbContext context)
        => _context = context;

    public async Task<Result<string>> Handle(
        CreateEstanteriaCommand request,
        CancellationToken cancellationToken)
    {
        var deposito = await _context.Depositos
            .FirstOrDefaultAsync(
                d => d.Id == request.IdDeposito,
                cancellationToken);

        if (deposito is null)
        {
            return Result<string>.Failure(
                EstanteriaErrors.DepositoNotFound(request.IdDeposito));
        }

        if (!deposito.Activo)
        {
            return Result<string>.Failure(
                EstanteriaErrors.DepositoInactive(deposito.Nombre));
        }

        var nombre = request.Nombre.Trim();

        var existing = await _context.Estanterias
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(
                e => e.IdDeposito == request.IdDeposito &&
                     e.Nombre == nombre,
                cancellationToken);

        if (existing is not null)
        {
            if (existing.IsDeleted)
            {
                return Result<string>.Failure(
                    EstanteriaErrors.SoftDeletedNombre(
                        existing.Nombre,
                        existing.Id));
            }

            return Result<string>.Failure(
                EstanteriaErrors.NameAlreadyExists(nombre));
        }

        var estanteria = new Estanteria
        {
            IdDeposito = request.IdDeposito,
            Nombre = nombre,
            Descripcion = request.Descripcion?.Trim()
        };

        _context.Estanterias.Add(estanteria);

        await _context.SaveChangesAsync(cancellationToken);

        return Result<string>.Success(estanteria.Id);
    }
}
