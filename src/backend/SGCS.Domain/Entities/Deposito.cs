
using System.Collections.ObjectModel;
using SGCS.Domain.Common;

namespace SGCS.Domain.Entities;

public class Deposito : ISoftDeletableEntity
{
    public Deposito() => Id = Guid.NewGuid().ToString();

    public string Id { get; private set; }
    public required string Nombre { get ; set; }
    public  string? Descripcion { get ; set; }
    public bool Activo { get ; set; }= true;

    public ICollection<Estanteria> Estanterias { get; set; } = new List<Estanteria>();

    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }
    
}