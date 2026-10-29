using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.Productos;

public static class ProductoErrors
{
    public static Error NotFound(string id) =>
        Error.NotFound(
            "Producto.NotFound",
            $"No se encontró el producto con ID '{id}'.");

    public static Error NameNotFound(string nombre) =>
        Error.NotFound(
            "Producto.NameNotFound",
            $"No se encontró ningún producto con el nombre '{nombre}'.");

    public static Error NameAlreadyExists(string nombre) =>
        Error.Conflict(
            "Producto.NameAlreadyExists",
            $"Ya existe un producto activo con el nombre '{nombre}'.");

    public static Error SoftDeletedName(string nombre, string existingProductoId) =>
        Error.Conflict(
            "Producto.SoftDeletedName",
            $"El nombre '{nombre}' pertenece a un producto que fue dado de baja.",
            new()
            {
                ["id"] = existingProductoId,
                ["nombre"] = nombre
            });

    public static Error NotDeleted(string id) =>
        Error.Conflict(
            "Producto.NotDeleted",
            $"El producto con ID '{id}' no se encuentra dado de baja.");

    public static Error CategoriaNotFound(string categoriaId) =>
        Error.NotFound(
            "Producto.CategoriaNotFound",
            $"No se encontró la categoría con ID '{categoriaId}'.");

    public static Error CategoriaNotLeaf(string categoriaId) =>
        Error.Conflict(
            "Producto.CategoriaNotLeaf",
            $"No se puede asignar la categoría con ID '{categoriaId}' porque no es una categoría hoja (contiene subcategorías).");

    public static Error GeneroNotFound(string generoId) =>
        Error.NotFound(
            "Producto.GeneroNotFound",
            $"No se encontró el género con ID '{generoId}'.");

    public static Error TemporadaNotFound(string temporadaId) =>
        Error.NotFound(
            "Producto.TemporadaNotFound",
            $"No se encontró la temporada con ID '{temporadaId}'.");

    public static Error FitNotFound(string fitId) =>
        Error.NotFound(
            "Producto.FitNotFound",
            $"No se encontró el calce (fit) con ID '{fitId}'.");

    public static Error MaterialNotFound(string materialId) =>
        Error.NotFound(
            "Producto.MaterialNotFound",
            $"No se encontró el material con ID '{materialId}'.");
}

