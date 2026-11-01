using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.EscalasTalles;

public static class EscalaTalleErrors
{
    public static Error NotFound(string id) =>
        Error.NotFound(
            "EscalaTalle.NotFound",
            $"No se encontró la escala de talle con ID '{id}'.");
}

