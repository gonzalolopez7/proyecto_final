using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.Talles;

public static class TalleErrors
{
    public static Error NotFound(string id) =>
        Error.NotFound(
            "Talle.NotFound",
            $"No se encontró el talle con ID '{id}'.");

    public static Error EscalaTalleNotFound(string escalaTalleId) =>
        Error.NotFound(
            "Talle.EscalaTalleNotFound",
            $"No se encontró la escala de talle con ID '{escalaTalleId}'.");
}
