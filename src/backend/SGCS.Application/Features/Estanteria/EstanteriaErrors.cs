
using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.Estanterias;

public static class EstanteriaErrors
{
    public static Error NotFound(string id) =>
        Error.NotFound(
            "Estanteria.NotFound",
            $"No se encontró la estantería con ID '{id}'.");

    public static Error NameAlreadyExists(string nombre) =>
        Error.Conflict(
            "Estanteria.NameAlreadyExists",
            $"Ya existe una estantería con el nombre '{nombre}' en ese depósito.");

    public static Error SoftDeletedNombre(string nombre, string existingId) =>
        Error.Conflict(
            "Estanteria.SoftDeletedNombre",
            $"La estantería '{nombre}' ya existe pero fue dada de baja.",
            new()
            {
                ["existingEstanteriaId"] = existingId,
                ["nombre"] = nombre
            });

    public static Error NotDeleted(string id) =>
        Error.Conflict(
            "Estanteria.NotDeleted",
            $"La estantería con ID '{id}' no se encuentra dada de baja.");

    public static Error DepositoNotFound(string id) =>
        Error.NotFound(
            "Estanteria.DepositoNotFound",
            $"No se encontró el depósito con ID '{id}'.");

    public static Error DepositoInactive(string nombre) =>
        Error.Conflict(
            "Estanteria.DepositoInactive",
            $"No se puede operar sobre la estantería porque el depósito '{nombre}' está inactivo.");

    public static Error HasStock(string id) =>
        Error.Conflict(
            "Estanteria.HasStock",
            $"No se puede eliminar la estantería '{id}' porque contiene stock.");

    public static Error AlreadyDeleted(string id) =>
        Error.Conflict(
            "Estanteria.AlreadyDeleted",
            $"La estantería '{id}' ya está eliminada.");
}
