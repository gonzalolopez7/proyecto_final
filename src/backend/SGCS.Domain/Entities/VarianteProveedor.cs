namespace SGCS.Domain.Entities;

public class VarianteProveedor
{
    public VarianteProveedor() => Id = Guid.NewGuid().ToString();

    public string Id { get; private set; }
    public required string IdVariante { get; set; }
    public Variante? Variante { get; set; }
    public required string IdProveedor { get; set; }
    public Proveedor? Proveedor { get; set; }
    public required string CodigoProveedor { get; set; }
    public required decimal Costo { get; set; }
}

