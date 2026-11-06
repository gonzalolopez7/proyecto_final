using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.Ubicaciones.Commands;

public record UpdateUbicacionRequest(
    int Cantidad
);

public record UpdateUbicacionCommand(
    string Id,
    int Cantidad
) : IRequest<Result>;

public class UpdateUbicacionCommandValidator
    : AbstractValidator<UpdateUbicacionCommand>
{
    public UpdateUbicacionCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID de la ubicación es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID de la ubicación no debe superar los 36 caracteres.");

        RuleFor(x => x.Cantidad)
            .GreaterThan(0)
            .WithMessage("La cantidad debe ser mayor a 0.");
    }
}

public class UpdateUbicacionCommandHandler
    : IRequestHandler<UpdateUbicacionCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public UpdateUbicacionCommandHandler(IApplicationDbContext context)
        => _context = context;

    public async Task<Result> Handle(
        UpdateUbicacionCommand request,
        CancellationToken cancellationToken)
    {
        var ubicacion = await _context.Ubicaciones
            .FirstOrDefaultAsync(
                u => u.Id == request.Id,
                cancellationToken);

        if (ubicacion is null)
        {
            return Result.Failure(
                UbicacionErrors.NotFound(request.Id));
        }

        ubicacion.Cantidad = request.Cantidad;

        _context.Ubicaciones.Update(ubicacion);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

