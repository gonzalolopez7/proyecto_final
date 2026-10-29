using FluentValidation;
using MediatR;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.User.Commands;

public record RestoreUserCommand(string Id) : IRequest<Result>;

public class RestoreUserCommandValidator : AbstractValidator<RestoreUserCommand>
{
    public RestoreUserCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID del usuario es obligatorio.");
    }
}

public class RestoreUserCommandHandler : IRequestHandler<RestoreUserCommand, Result>
{
    private readonly IIdentityService _identityService;

    public RestoreUserCommandHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public async Task<Result> Handle(RestoreUserCommand request, CancellationToken cancellationToken)
    {
        return await _identityService.RestoreAsync(request.Id);
    }
}
