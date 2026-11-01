using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.Colores;

public static class ColorErrors
{
    public static Error NotFound(string id) =>
        Error.NotFound(
            "Color.NotFound",
            $"No se encontró el color con ID '{id}'.");

    public static Error NameAlreadyExists(string nombre) =>
        Error.Conflict(
            "Color.NameAlreadyExists",
            $"Ya existe un color con el nombre '{nombre}'.");

    public static Error CodeAlreadyExists(string codigo) =>
        Error.Conflict(
            "Color.CodeAlreadyExists",
            $"Ya existe un color con el código '{codigo}'.");

    public static Error InUse(string id, int cantidadVariantes) =>
        Error.Conflict(
            "Color.InUse",
            $"No se puede eliminar el color con ID '{id}' porque está asignado a {cantidadVariantes} variante(s).",
            new()
            {
                ["id"] = id,
                ["cantidadVariantes"] = cantidadVariantes
            });
}

