using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SGCS.Domain.Entities;

namespace SGCS.Infrastructure.Data.Configurations;

public class CategoriaConfiguration : IEntityTypeConfiguration<Categoria>
{
    public void Configure(EntityTypeBuilder<Categoria> builder)
    {
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Id)
            .HasMaxLength(36);

        builder.Property(c => c.Nombre)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.IdPadre)
            .HasMaxLength(36);

        // Relación autorreferencial (Padre - Subcategorías)
        builder.HasOne(c => c.Padre)
            .WithMany(p => p.Subcategorias)
            .HasForeignKey(c => c.IdPadre)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);

        // Índice para búsquedas rápidas por categoría padre
        builder.HasIndex(c => c.IdPadre);
    }
}
