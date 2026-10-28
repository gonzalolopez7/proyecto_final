using SGCS.Domain.Common;

namespace SGCS.Domain.Entities;

public class Proveedor : ISoftDeletableEntity
{
    public Proveedor()
    {
        Id = Guid.NewGuid().ToString();
    }

    public string Id { get; set; }
    public required string Nombre { get; set; }
    public required string RazonSocial { get; set; }
    public required string Cuit { get; set; }
    public string? Telefono { get; set; }
    public string? Direccion { get; set; }
    public string? Email { get; set; }
    public int DiasPago { get; set; }
    public decimal SaldoInicial { get; set; }

    // ISoftDeletableEntity
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }
}