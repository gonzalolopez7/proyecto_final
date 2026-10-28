using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.Atributos;

public static class AtributoErrors
{
    // Errores Genéricos por Tipo de Atributo
    public static Error NotFound(string tipo, string id) =>
        Error.NotFound(
            $"{tipo}.NotFound",
            $"No se encontró el/la {tipo} con ID '{id}'.");

    public static Error NameAlreadyExists(string tipo, string nombre) =>
        Error.Conflict(
            $"{tipo}.NameAlreadyExists",
            $"Ya existe un/a {tipo} con el nombre '{nombre}'.");

    public static Error InUse(string tipo, string id, int cantidadProductos) =>
        Error.Conflict(
            $"{tipo}.InUse",
            $"No se puede eliminar el/la {tipo} con ID '{id}' porque está asignado/a a {cantidadProductos} producto(s).",
            new()
            {
                ["id"] = id,
                ["tipo"] = tipo,
                ["cantidadProductos"] = cantidadProductos
            });

    // Errores específicos de Género
    public static Error GeneroNotFound(string id) => NotFound("Género", id);
    public static Error GeneroAlreadyExists(string nombre) => NameAlreadyExists("Género", nombre);
    public static Error GeneroInUse(string id, int count) => InUse("Género", id, count);

    // Errores específicos de Temporada
    public static Error TemporadaNotFound(string id) => NotFound("Temporada", id);
    public static Error TemporadaAlreadyExists(string nombre) => NameAlreadyExists("Temporada", nombre);
    public static Error TemporadaInUse(string id, int count) => InUse("Temporada", id, count);

    // Errores específicos de Fit
    public static Error FitNotFound(string id) => NotFound("Fit", id);
    public static Error FitAlreadyExists(string nombre) => NameAlreadyExists("Fit", nombre);
    public static Error FitInUse(string id, int count) => InUse("Fit", id, count);

    // Errores específicos de Material
    public static Error MaterialNotFound(string id) => NotFound("Material", id);
    public static Error MaterialAlreadyExists(string nombre) => NameAlreadyExists("Material", nombre);
    public static Error MaterialInUse(string id, int count) => InUse("Material", id, count);
}

