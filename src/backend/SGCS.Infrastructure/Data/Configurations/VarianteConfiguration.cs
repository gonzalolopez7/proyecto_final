using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SGCS.Domain.Entities;

namespace SGCS.Infrastructure.Data.Configurations;

public class VarianteConfiguration : IEntityTypeConfiguration<Variante>
{
    public void Configure(EntityTypeBuilder<Variante> builder)
    {
        // 1. Clave Primaria
        builder.HasKey(v => v.Id);
        builder.Property(v => v.Id).HasMaxLength(36);

        // 2. Propiedades de Dominio
        builder.Property(v => v.IdProducto)
            .IsRequired()
            .HasMaxLength(36);

        builder.Property(v => v.Sku)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(v => v.IdTalle)
            .IsRequired()
            .HasMaxLength(36);

        builder.Property(v => v.IdColor)
            .IsRequired()
            .HasMaxLength(36);

        builder.Property(v => v.StockMinimo)
            .IsRequired();

        // 3. Soft Delete
        builder.Property(v => v.IsDeleted)
            .HasDefaultValue(false);

        builder.Property(v => v.DeletedBy)
            .HasMaxLength(36);

        // 4. Índices
        builder.HasIndex(v => v.Sku)
            .IsUnique();

        // No permitir variantes duplicadas con mismo talle y color para un mismo producto
        builder.HasIndex(v => new { v.IdProducto, v.IdTalle, v.IdColor })
            .IsUnique();

        // 5. Relaciones
        builder.HasOne(v => v.Producto)
            .WithMany()
            .HasForeignKey(v => v.IdProducto)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(v => v.Talle)
            .WithMany()
            .HasForeignKey(v => v.IdTalle)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(v => v.Color)
            .WithMany()
            .HasForeignKey(v => v.IdColor)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
