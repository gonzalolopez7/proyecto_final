using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SGCS.Domain.Entities;

namespace SGCS.Infrastructure.Data.Configurations;

public class CategoriaConfiguration : IEntityTypeConfiguration<Categoria>
{
    public void Configure(EntityTypeBuilder<Categoria> builder)
    {
        // 1. Clave Primaria
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).HasMaxLength(36);

        // 2. Propiedades de Dominio
        builder.Property(c => c.Nombre)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.IdPadre)
            .HasMaxLength(36);

        // 3. Índices
        builder.HasIndex(c => c.IdPadre);

        // 4. Relaciones
        // Relación autorreferencial (Padre - Subcategorías)
        builder.HasOne(c => c.Padre)
            .WithMany(p => p.Subcategorias)
            .HasForeignKey(c => c.IdPadre)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
