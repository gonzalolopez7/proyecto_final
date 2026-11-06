using SGCS.Domain.Common;

namespace SGCS.Domain.Entities;

public class Estanteria : ISoftDeletableEntity
{
    public Estanteria() => Id = Guid.NewGuid().ToString();
    public string Id { get; private set;}
    public required string IdDeposito { get; set; }
    public Deposito Deposito { get; set; } = null!;
    public required string Nombre { get; set; }   // ej. "A1", "Pasillo 3 - Rack 2"
    public string? Descripcion { get; set; }

    public ICollection<Ubicacion> Ubicaciones { get; set;} = new List<Ubicacion>();

    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }


}