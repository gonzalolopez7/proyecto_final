using System.Data.Common;
using System.Security.Cryptography.X509Certificates;
using SGCS.Domain.Common;

namespace SGCS.Domain.Entities;

public class Variante : ISoftDeletableEntity
{
    public Variante() => Id = Guid.NewGuid().ToString();

    public string Id { get; private set; }
    public required string IdProducto { get; set; }
    public Producto? Producto { get; set; }
    public required string Sku { get; set; }
    public required string IdTalle { get; set; }
    public Talle? Talle { get; set; }
    public required string IdColor { get; set; }
    public Color? Color { get; set; }
    public required int StockMinimo { get; set; }

    // ISoftDeletableEntity
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }
}
