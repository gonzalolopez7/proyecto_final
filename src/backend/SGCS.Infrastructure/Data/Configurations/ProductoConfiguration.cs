using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SGCS.Domain.Entities;

namespace SGCS.Infrastructure.Data.Configurations;

public class ProductoConfiguration : IEntityTypeConfiguration<Producto>
{
    public void Configure(EntityTypeBuilder<Producto> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Id)
            .HasMaxLength(36);

        builder.Property(p => p.Nombre)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.Descripcion)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(p => p.IdCategoria)
            .IsRequired()
            .HasMaxLength(36);

        builder.Property(p => p.IdGenero)
            .HasMaxLength(36);

        builder.Property(p => p.IdTemporada)
            .HasMaxLength(36);

        builder.Property(p => p.IdFit)
            .HasMaxLength(36);

        builder.Property(p => p.IdMaterial)
            .HasMaxLength(36);

        builder.Property(p => p.IsDeleted)
            .HasDefaultValue(false);

        builder.Property(p => p.DeletedBy)
            .HasMaxLength(256);

        // Índice único en Nombre
        builder.HasIndex(p => p.Nombre)
            .IsUnique();

        // Relaciones
        builder.HasOne(p => p.Categoria)
            .WithMany()
            .HasForeignKey(p => p.IdCategoria)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.Genero)
            .WithMany()
            .HasForeignKey(p => p.IdGenero)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(p => p.Temporada)
            .WithMany()
            .HasForeignKey(p => p.IdTemporada)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(p => p.Fit)
            .WithMany()
            .HasForeignKey(p => p.IdFit)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(p => p.Material)
            .WithMany()
            .HasForeignKey(p => p.IdMaterial)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
