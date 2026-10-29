using FluentValidation;
using MediatR;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Domain.Entities;

namespace SGCS.Application.Features.User.Commands;

public record UpdateUserRequest(
    string UserName,
    string FirstName,
    string LastName,
    string? Email,
    string? PhoneNumber,
    string Role);

public record UpdateUserCommand(
    string Id,
    string UserName,
    string FirstName,
    string LastName,
    string? Email,
    string? PhoneNumber,
    string Role
) : IRequest<Result>;

public class UpdateUserCommandValidator : AbstractValidator<UpdateUserCommand>
{
    public UpdateUserCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID del usuario es obligatorio.");

        RuleFor(x => x.UserName)
            .NotEmpty()
            .WithMessage("El nombre de usuario es obligatorio.")
            .MinimumLength(4)
            .WithMessage("El nombre de usuario debe tener al menos 4 caracteres.");

        RuleFor(x => x.Role)
            .NotEmpty()
            .WithMessage("El rol es obligatorio.")
            .Must(x => Roles.SupportedRoles.Contains(x))
            .WithMessage("El rol especificado no es válido.");

        RuleFor(x => x.FirstName)
            .NotEmpty()
            .WithMessage("El nombre es obligatorio.");

        RuleFor(x => x.LastName)
            .NotEmpty()
            .WithMessage("El apellido es obligatorio.");

        RuleFor(x => x.Email)
            .EmailAddress()
            .When(x => !string.IsNullOrEmpty(x.Email))
            .WithMessage("El formato del correo electrónico no es válido.");

        RuleFor(x => x.PhoneNumber)
            .Length(10)
            .When(x => !string.IsNullOrEmpty(x.PhoneNumber))
            .WithMessage("El teléfono debe tener 10 dígitos.")
            .Matches("^[0-9]*$")
            .When(x => !string.IsNullOrEmpty(x.PhoneNumber))
            .WithMessage("El teléfono solo debe contener dígitos.");
    }
}

public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand, Result>
{
    private readonly IIdentityService _identityService;

    public UpdateUserCommandHandler(IIdentityService identityService) => _identityService = identityService;

    public async Task<Result> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {

        var result = await _identityService.UpdateAsync(
            request.Id,
            request.UserName,
            request.FirstName,
            request.LastName,
            request.Email,
            request.PhoneNumber
        );

        if (!result.Succeeded)
            return Result.Failure(result.Errors);

        var currentRole = await _identityService.GetRoleAsync(request.Id);

        if (currentRole != request.Role)
        {
            var resultUnassignRole = await _identityService.UnassignRoleAsync(request.Id, currentRole!);

            if (!resultUnassignRole.Succeeded)
                return Result.Failure(resultUnassignRole.Errors);

            var resultAssignRole = await _identityService.AssignRoleAsync(request.Id, request.Role);

            if (!resultAssignRole.Succeeded)
                return Result.Failure(resultAssignRole.Errors);
        }

        return Result.Success();
    }
}
