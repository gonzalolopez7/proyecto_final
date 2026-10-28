using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.Categorias;

public static class CategoriaErrors
{
    public static Error NotFound(string id) =>
        Error.NotFound(
            "Categoria.NotFound",
            $"No se encontró la categoría con ID '{id}'.");

    public static Error NameAlreadyExists(string nombre) =>
        Error.Conflict(
            "Categoria.NameAlreadyExists",
            $"Ya existe una categoría con el nombre '{nombre}'.");

    public static Error ParentNotFound(string parentId) =>
        Error.NotFound(
            "Categoria.ParentNotFound",
            $"No se encontró la categoría padre con ID '{parentId}'.");

    public static Error CannotBeOwnParent(string id) =>
        Error.Conflict(
            "Categoria.CannotBeOwnParent",
            $"Una categoría no puede ser su propio padre.");

    public static Error CircularReference(string id, string parentId) =>
        Error.Conflict(
            "Categoria.CircularReference",
            $"No se puede asignar la categoría con ID '{parentId}' como padre porque generaría una referencia circular.");

    public static Error HasChildren(string id) =>
        Error.Conflict(
            "Categoria.HasChildren",
            $"No se puede eliminar la categoría con ID '{id}' porque contiene subcategorías asociadas.");

    public static Error HasProducts(string id) =>
        Error.Conflict(
            "Categoria.HasProducts",
            $"No se puede eliminar la categoría con ID '{id}' porque tiene productos asociados.");
}

