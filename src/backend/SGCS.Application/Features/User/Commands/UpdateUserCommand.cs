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
            .WithMessage("User id is required.");

        RuleFor(x => x.UserName)
            .NotEmpty()
            .WithMessage("Username is required.")
            .MinimumLength(4)
            .WithMessage("Username must be at least 4 characters long.");

        RuleFor(x => x.Role)
            .NotEmpty()
            .WithMessage("Role is required.")
            .Must(x => Roles.SupportedRoles.Contains(x))
            .WithMessage("Invalid role.");

        RuleFor(x => x.FirstName)
            .NotEmpty()
            .WithMessage("First name is required.");

        RuleFor(x => x.LastName)
            .NotEmpty()
            .WithMessage("Last name is required.");

        RuleFor(x => x.Email)
            .EmailAddress()
            .When(x => !string.IsNullOrEmpty(x.Email))
            .WithMessage("Invalid email address.");

        RuleFor(x => x.PhoneNumber)
            .Length(10)
            .When(x => !string.IsNullOrEmpty(x.PhoneNumber))
            .WithMessage("Phone number must be 10 digits long.")
            .Matches("^[0-9]*$")
            .When(x => !string.IsNullOrEmpty(x.PhoneNumber))
            .WithMessage("Phone number must contain only digits.");
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
