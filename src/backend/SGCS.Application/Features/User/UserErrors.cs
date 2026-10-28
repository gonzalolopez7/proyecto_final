using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.User;

public static class UserErrors
{
    public static Error NotFound(string id) =>
        Error.NotFound(
            "User.NotFound",
            $"No se encontró el usuario con ID '{id}'.");

    public static Error UserNameAlreadyExists(string userName) =>
        Error.Conflict(
            "User.UserNameAlreadyExists",
            $"El nombre de usuario '{userName}' ya se encuentra registrado.");

    public static Error EmailAlreadyExists(string email) =>
        Error.Conflict(
            "User.EmailAlreadyExists",
            $"El correo electrónico '{email}' ya se encuentra registrado.");

    public static Error SoftDeletedUser(string userName, string existingUserId) =>
        Error.Conflict(
            "User.SoftDeletedUser",
            $"El nombre de usuario o correo pertenece a un usuario que fue dado de baja.",
            new()
            {
                ["id"] = existingUserId,
                ["userName"] = userName
            });

    public static Error NotDeleted(string id) =>
        Error.Conflict(
            "User.NotDeleted",
            $"El usuario con ID '{id}' no se encuentra dado de baja.");

    public static Error RoleNotFound(string role) =>
        Error.NotFound(
            "User.RoleNotFound",
            $"El rol '{role}' no fue encontrado en el sistema.");
}
