
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SGCS.Domain.Entities;

namespace SGCS.Infrastructure.Data.Configurations;

public class UbicacionConfiguration : IEntityTypeConfiguration<Ubicacion>
{
    public void Configure(EntityTypeBuilder<Ubicacion> builder)
    {
        builder.HasKey(u => u.Id);

        builder.Property(u => u.Id)
            .HasMaxLength(36);

        builder.Property(u => u.IdVariante)
            .IsRequired()
            .HasMaxLength(36);

        builder.Property(u => u.IdEstanteria)
            .IsRequired()
            .HasMaxLength(36);

        builder.Property(u => u.Cantidad)
            .HasDefaultValue(0);

        // Relación con Variante
        builder.HasOne(u => u.Variante)
            .WithMany()
            .HasForeignKey(u => u.IdVariante)
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict);

        // Relación con Estantería
        builder.HasOne(u => u.Estanteria)
            .WithMany(e => e.Ubicaciones)
            .HasForeignKey(u => u.IdEstanteria)
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict);

        // Evitar duplicar una variante en la misma estantería
        builder.HasIndex(u => new { u.IdVariante, u.IdEstanteria })
            .IsUnique();

        // Filtro global de ubicaciones:
        // La variante no debe estar eliminada lógicamente.
        // La estantería no debe estar eliminada lógicamente.
        // El depósito no debe estar eliminado lógicamente.
        builder.HasQueryFilter(u =>
            u.Variante != null &&
            !u.Variante.IsDeleted &&
            u.Estanteria != null &&
            !u.Estanteria.IsDeleted &&
            u.Estanteria.Deposito != null &&
            !u.Estanteria.Deposito.IsDeleted
        );
    }
}
