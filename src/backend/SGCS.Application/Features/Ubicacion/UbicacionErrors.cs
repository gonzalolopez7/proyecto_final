using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.Ubicaciones;

public static class UbicacionErrors
{
    public static Error NotFound(string id) =>
        Error.NotFound(
            "Ubicacion.NotFound",
            $"No se encontró la ubicación con ID '{id}'.");

    public static Error VarianteNotFound(string id) =>
        Error.NotFound(
            "Ubicacion.VarianteNotFound",
            $"No se encontró la variante con ID '{id}'.");

    public static Error VarianteDeleted(string id) =>
        Error.Conflict(
            "Ubicacion.VarianteDeleted",
            $"No se puede asignar stock porque la variante '{id}' está eliminada.");

    public static Error EstanteriaNotFound(string id) =>
        Error.NotFound(
            "Ubicacion.EstanteriaNotFound",
            $"No se encontró la estantería con ID '{id}'.");

    public static Error EstanteriaDeleted(string id) =>
        Error.Conflict(
            "Ubicacion.EstanteriaDeleted",
            $"No se puede asignar stock porque la estantería '{id}' está eliminada.");

    public static Error DepositoInactive(string nombre) =>
        Error.Conflict(
            "Ubicacion.DepositoInactive",
            $"No se puede asignar stock porque el depósito '{nombre}' está inactivo.");

    public static Error InvalidQuantity() =>
        Error.Validation(
            "Ubicacion.InvalidQuantity",
            "La cantidad no puede ser negativa.");

    public static Error InsufficientStock(int disponible, int solicitado) =>
        Error.Conflict(
            "Ubicacion.InsufficientStock",
            $"Stock insuficiente. Disponible: {disponible}. Solicitado: {solicitado}.");
}