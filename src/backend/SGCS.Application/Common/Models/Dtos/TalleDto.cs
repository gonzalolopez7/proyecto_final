namespace SGCS.Application.Common.Models.Dtos;

public record TalleDto(
    string Id,
    string IdEscalaTalle,
    string? EscalaTalleNombre,
    string Nombre,
    int Orden
);

