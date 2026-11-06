using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using SGCS.Domain.Entities;

namespace SGCS.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DatabaseFacade Database { get; }

    DbSet<Proveedor> Proveedores { get; }
    DbSet<Producto> Productos { get; }
    DbSet<Categoria> Categorias { get; }
    DbSet<Genero> Generos { get; }
    DbSet<Temporada> Temporadas { get; }
    DbSet<Fit> Fits { get; }
    DbSet<Material> Materiales { get; }
    DbSet<Variante> Variantes { get; }
    DbSet<VarianteProveedor> VariantesProveedores { get; }
    DbSet<EscalaTalle> EscalasTalles { get; }
    DbSet<Talle> Talles { get; }
    DbSet<Color> Colores { get; }

    DbSet<Deposito> Depositos { get; }
    DbSet<Estanteria> Estanterias { get; }
    DbSet<Ubicacion> Ubicaciones { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
