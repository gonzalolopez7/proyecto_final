using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Domain.Entities;

namespace SGCS.Application.Features.Atributos.Commands;

// --- CREATE ---
public record CreateMaterialCommand(string Nombre) : IRequest<Result<string>>;

public class CreateMaterialCommandValidator : AbstractValidator<CreateMaterialCommand>
{
    public CreateMaterialCommandValidator()
    {
        RuleFor(x => x.Nombre)
            .NotEmpty()
            .WithMessage("El nombre del material es obligatorio.")
            .MaximumLength(100)
            .WithMessage("El nombre del material no debe superar los 100 caracteres.");
    }
}

public class CreateMaterialCommandHandler : IRequestHandler<CreateMaterialCommand, Result<string>>
{
    private readonly IApplicationDbContext _context;

    public CreateMaterialCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<string>> Handle(CreateMaterialCommand request, CancellationToken cancellationToken)
    {
        var exists = await _context.Materiales
            .AnyAsync(m => m.Nombre == request.Nombre, cancellationToken);

        if (exists)
            return Result<string>.Failure(AtributoErrors.MaterialAlreadyExists(request.Nombre));

        var material = new Material
        {
            Nombre = request.Nombre
        };

        _context.Materiales.Add(material);

        await _context.SaveChangesAsync(cancellationToken);

        return Result<string>.Success(material.Id);
    }
}

// --- UPDATE ---
public record UpdateMaterialRequest(string Nombre);

public record UpdateMaterialCommand(string Id, string Nombre) : IRequest<Result>;

public class UpdateMaterialCommandValidator : AbstractValidator<UpdateMaterialCommand>
{
    public UpdateMaterialCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID del material es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID del material no debe superar los 36 caracteres.");

        RuleFor(x => x.Nombre)
            .NotEmpty()
            .WithMessage("El nombre del material es obligatorio.")
            .MaximumLength(100)
            .WithMessage("El nombre del material no debe superar los 100 caracteres.");
    }
}

public class UpdateMaterialCommandHandler : IRequestHandler<UpdateMaterialCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public UpdateMaterialCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result> Handle(UpdateMaterialCommand request, CancellationToken cancellationToken)
    {
        var material = await _context.Materiales.FindAsync([request.Id], cancellationToken);

        if (material is null)
            return Result.Failure(AtributoErrors.MaterialNotFound(request.Id));

        if (material.Nombre != request.Nombre)
        {
            var exists = await _context.Materiales
                .AnyAsync(m => m.Nombre == request.Nombre && m.Id != request.Id, cancellationToken);

            if (exists)
                return Result.Failure(AtributoErrors.MaterialAlreadyExists(request.Nombre));
        }

        material.Nombre = request.Nombre;

        _context.Materiales.Update(material);

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

// --- DELETE ---
public record DeleteMaterialCommand(string Id) : IRequest<Result>;

public class DeleteMaterialCommandValidator : AbstractValidator<DeleteMaterialCommand>
{
    public DeleteMaterialCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID del material es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID del material no debe superar los 36 caracteres.");
    }
}

public class DeleteMaterialCommandHandler : IRequestHandler<DeleteMaterialCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public DeleteMaterialCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result> Handle(DeleteMaterialCommand request, CancellationToken cancellationToken)
    {
        var material = await _context.Materiales.FindAsync([request.Id], cancellationToken);

        if (material is null)
            return Result.Failure(AtributoErrors.MaterialNotFound(request.Id));

        var inUseCount = await _context.Productos
            .CountAsync(p => p.IdMaterial == request.Id, cancellationToken);

        if (inUseCount > 0)
            return Result.Failure(AtributoErrors.MaterialInUse(request.Id, inUseCount));

        _context.Materiales.Remove(material);

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
