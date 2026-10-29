using FluentValidation;
using MediatR;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.User.Commands;

public record ResetPasswordRequest(string NewPassword);

public record ResetPasswordCommand(
    string Id,
    string NewPassword
) : IRequest<Result>;

public class ResetPasswordCommandValidator : AbstractValidator<ResetPasswordCommand>
{
    public ResetPasswordCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID del usuario es obligatorio.");

        RuleFor(x => x.NewPassword)
            .NotEmpty()
            .WithMessage("La contraseña es obligatoria.")
            .MinimumLength(4)
            .WithMessage("La contraseña debe tener al menos 4 caracteres.");
    }
}

public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, Result>
{
    private readonly IIdentityService _identityService;

    public ResetPasswordCommandHandler(IIdentityService identityService) => _identityService = identityService;

    public async Task<Result> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        var result = await _identityService.ResetPasswordAsync(request.Id, request.NewPassword);

        if (!result.Succeeded)
            return Result.Failure(result.Errors);

        return Result.Success();
    }
}