
using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.Depositos;

public static class DepositoErrors
{
    public static Error NotFound(string id) =>
        Error.NotFound(
            "Deposito.NotFound",
            $"No se encontró el depósito con ID '{id}'.");

    public static Error NameAlreadyExists(string nombre) =>
        Error.Conflict(
            "Deposito.NameAlreadyExists",
            $"Ya existe un depósito con el nombre '{nombre}'.");

    public static Error SoftDeletedNombre(string nombre, string existingId) =>
        Error.Conflict(
            "Deposito.SoftDeletedNombre",
            $"El depósito '{nombre}' ya existe pero fue dado de baja.",
            new()
            {
                ["existingDepositoId"] = existingId,
                ["nombre"] = nombre
            });

    public static Error NotDeleted(string id) =>
        Error.Conflict(
            "Deposito.NotDeleted",
            $"El depósito con ID '{id}' no se encuentra dado de baja.");

    public static Error HasActiveShelves(string id) =>
        Error.Conflict(
            "Deposito.HasActiveShelves",
            $"No se puede eliminar el depósito '{id}' porque tiene estanterías activas.");

    public static Error HasStock(string id) =>
        Error.Conflict(
            "Deposito.HasStock",
            $"No se puede eliminar el depósito '{id}' porque todavía contiene stock.");

    public static Error AlreadyInState(string id, bool activo) =>
        Error.Conflict(
            "Deposito.AlreadyInState",
            $"El depósito '{id}' ya se encuentra {(activo ? "activo" : "inactivo")}.");
}
