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

    public static Error EstanteriaNotFound(string id) =>
        Error.NotFound(
            "Ubicacion.EstanteriaNotFound",
            $"No se encontró la estantería con ID '{id}'.");

    public static Error RelationAlreadyExists(string sku, string estanteriaNombre) =>
        Error.Conflict(
            "Ubicacion.RelationAlreadyExists",
            $"La variante con SKU '{sku}' ya se encuentra asignada a la estantería '{estanteriaNombre}'.");
}
