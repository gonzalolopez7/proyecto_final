using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.Variantes;

public static class VarianteErrors
{
    public static Error NotFound(string id) =>
        Error.NotFound(
            "Variante.NotFound",
            $"No se encontró la variante con ID '{id}'.");

    public static Error SkuNotFound(string sku) =>
        Error.NotFound(
            "Variante.SkuNotFound",
            $"No se encontró ninguna variante con el SKU '{sku}'.");

    public static Error SkuAlreadyExists(string sku) =>
        Error.Conflict(
            "Variante.SkuAlreadyExists",
            $"Ya existe una variante activa con el SKU '{sku}'.");

    public static Error SoftDeletedSku(string sku, string existingVarianteId) =>
        Error.Conflict(
            "Variante.SoftDeletedSku",
            $"El SKU '{sku}' pertenece a una variante que fue dada de baja.",
            new()
            {
                ["id"] = existingVarianteId,
                ["sku"] = sku
            });

    public static Error CombinationAlreadyExists(string productoNombre, string colorNombre, string talleNombre) =>
        Error.Conflict(
            "Variante.CombinationAlreadyExists",
            $"Ya existe una variante activa para el producto '{productoNombre}' con color '{colorNombre}' y talle '{talleNombre}'.");

    public static Error SoftDeletedCombination(string existingVarianteId, string colorNombre, string talleNombre) =>
        Error.Conflict(
            "Variante.SoftDeletedCombination",
            $"La combinación de color '{colorNombre}' y talle '{talleNombre}' pertenece a una variante que fue dada de baja.",
            new()
            {
                ["id"] = existingVarianteId,
                ["color"] = colorNombre,
                ["talle"] = talleNombre
            });

    public static Error NotDeleted(string id) =>
        Error.Conflict(
            "Variante.NotDeleted",
            $"La variante con ID '{id}' no se encuentra dada de baja.");

    public static Error ProductoNotFound(string productoId) =>
        Error.NotFound(
            "Variante.ProductoNotFound",
            $"No se encontró el producto con ID '{productoId}'.");

    public static Error TalleNotFound(string talleId) =>
        Error.NotFound(
            "Variante.TalleNotFound",
            $"No se encontró el talle con ID '{talleId}'.");

    public static Error ColorNotFound(string colorId) =>
        Error.NotFound(
            "Variante.ColorNotFound",
            $"No se encontró el color con ID '{colorId}'.");

    public static Error TalleNotBelongToProductoEscala(string talleNombre, string productoNombre, string escalaNombre) =>
        Error.Conflict(
            "Variante.TalleNotBelongToProductEscala",
            $"El talle '{talleNombre}' no pertenece a la escala '{escalaNombre}' asignada al producto '{productoNombre}'.");
}

