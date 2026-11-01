using FluentValidation;
using MediatR;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.Variantes.Commands;

public record DeleteVarianteCommand(string Id) : IRequest<Result>;

public class DeleteVarianteCommandValidator : AbstractValidator<DeleteVarianteCommand>
{
    public DeleteVarianteCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID de la variante es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID de la variante no debe superar los 36 caracteres.");
    }
}

public class DeleteVarianteCommandHandler : IRequestHandler<DeleteVarianteCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public DeleteVarianteCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result> Handle(DeleteVarianteCommand request, CancellationToken cancellationToken)
    {
        var variante = await _context.Variantes.FindAsync([request.Id], cancellationToken);

        if (variante is null)
            return Result.Failure(VarianteErrors.NotFound(request.Id));

        _context.Variantes.Remove(variante);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

