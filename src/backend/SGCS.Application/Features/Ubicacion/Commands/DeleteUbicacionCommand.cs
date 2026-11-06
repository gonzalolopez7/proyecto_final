using FluentValidation;
using MediatR;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.Ubicaciones.Commands;

public record DeleteUbicacionCommand(string Id) : IRequest<Result>;

public class DeleteUbicacionCommandValidator
    : AbstractValidator<DeleteUbicacionCommand>
{
    public DeleteUbicacionCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID de la ubicación es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID de la ubicación no debe superar los 36 caracteres.");
    }
}

public class DeleteUbicacionCommandHandler
    : IRequestHandler<DeleteUbicacionCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public DeleteUbicacionCommandHandler(IApplicationDbContext context)
        => _context = context;

    public async Task<Result> Handle(
        DeleteUbicacionCommand request,
        CancellationToken cancellationToken)
    {
        var ubicacion = await _context.Ubicaciones
            .FindAsync([request.Id], cancellationToken);

        if (ubicacion is null)
        {
            return Result.Failure(
                UbicacionErrors.NotFound(request.Id));
        }

        _context.Ubicaciones.Remove(ubicacion);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

