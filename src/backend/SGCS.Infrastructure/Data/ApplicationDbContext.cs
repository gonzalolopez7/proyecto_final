using System.Linq.Expressions;
using System.Reflection;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Domain.Common;
using SGCS.Domain.Entities;
using SGCS.Infrastructure.Identity;

namespace SGCS.Infrastructure.Data;

public class ApplicationDbContext : IdentityDbContext<
    ApplicationUser, ApplicationRole, string,
    IdentityUserClaim<string>, ApplicationUserRole, IdentityUserLogin<string>,
    IdentityRoleClaim<string>, IdentityUserToken<string>>, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // Query filter for ISoftDeletableEntity
        foreach (var entityType in builder.Model.GetEntityTypes()
            .Where(t => typeof(ISoftDeletableEntity).IsAssignableFrom(t.ClrType)))
        {
            var parameter = Expression.Parameter(entityType.ClrType, "e");
            var property = Expression.Property(parameter, nameof(ISoftDeletableEntity.IsDeleted));
            var filter = Expression.Lambda(Expression.Not(property), parameter);

            builder.Entity(entityType.ClrType).HasQueryFilter(filter);
        }
    }

    public DbSet<Proveedor> Proveedores => Set<Proveedor>();
    public DbSet<Producto> Productos => Set<Producto>();
    public DbSet<Categoria> Categorias => Set<Categoria>();
    public DbSet<Genero> Generos => Set<Genero>();
    public DbSet<Temporada> Temporadas => Set<Temporada>();
    public DbSet<Fit> Fits => Set<Fit>();
    public DbSet<Material> Materiales => Set<Material>();

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await base.SaveChangesAsync(cancellationToken);
    }
}
