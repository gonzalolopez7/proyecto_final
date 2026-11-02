using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SGCS.Domain.Entities;

namespace SGCS.Infrastructure.Data.Configurations;

public class VarianteProveedorConfiguration : IEntityTypeConfiguration<VarianteProveedor>
{
    public void Configure(EntityTypeBuilder<VarianteProveedor> builder)
    {
        // 1. Clave Primaria
        builder.HasKey(vp => vp.Id);
        builder.Property(vp => vp.Id).HasMaxLength(36);

        // 2. Propiedades de Dominio
        builder.Property(vp => vp.IdVariante)
            .IsRequired()
            .HasMaxLength(36);

        builder.Property(vp => vp.IdProveedor)
            .IsRequired()
            .HasMaxLength(36);

        builder.Property(vp => vp.CodigoProveedor)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(vp => vp.Costo)
            .IsRequired()
            .HasPrecision(18, 2);

        // 3. Índices
        // Un proveedor solo puede estar vinculado una vez a la misma variante
        builder.HasIndex(vp => new { vp.IdVariante, vp.IdProveedor })
            .IsUnique();

        // Un proveedor no puede repetir el mismo código en dos variantes distintas
        builder.HasIndex(vp => new { vp.IdProveedor, vp.CodigoProveedor })
            .IsUnique();

        // 4. Relaciones
        builder.HasOne(vp => vp.Variante)
            .WithMany()
            .HasForeignKey(vp => vp.IdVariante)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(vp => vp.Proveedor)
            .WithMany()
            .HasForeignKey(vp => vp.IdProveedor)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
