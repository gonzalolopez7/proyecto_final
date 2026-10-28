namespace SGCS.Application.Common.Models.Dtos;

public record ProveedorDto(
    string Id,
    string Nombre,
    string RazonSocial,
    string Cuit,
    string? Telefono,
    string? Direccion,
    string? Email,
    int DiasPago,
    decimal SaldoInicial
);
