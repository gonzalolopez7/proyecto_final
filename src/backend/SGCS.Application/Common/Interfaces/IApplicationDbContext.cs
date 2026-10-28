using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using SGCS.Domain.Entities;

namespace SGCS.Application.Common.Interfaces;

public interface IApplicationDbContext
{

    DatabaseFacade Database { get; }

    DbSet<Proveedor> Proveedores { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
