using SGCS.Domain.Common;

namespace SGCS.Domain.Entities;

public class Estanteria : ISoftDeletableEntity
{
    public Estanteria() => Id = Guid.NewGuid().ToString();

    public string Id { get; private set; }
    public required string IdDeposito { get; set; }
    public Deposito? Deposito { get; set; }
    public required string Nombre { get; set; }
    public string? Descripcion { get; set; }

    // ISoftDeletableEntity
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }
}
