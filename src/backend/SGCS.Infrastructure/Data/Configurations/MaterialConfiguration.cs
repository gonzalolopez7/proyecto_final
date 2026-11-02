using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SGCS.Domain.Entities;

namespace SGCS.Infrastructure.Data.Configurations;

public class MaterialConfiguration : IEntityTypeConfiguration<Material>
{
    public void Configure(EntityTypeBuilder<Material> builder)
    {
        // 1. Clave Primaria
        builder.HasKey(m => m.Id);
        builder.Property(m => m.Id).HasMaxLength(36);

        // 2. Propiedades de Dominio
        builder.Property(m => m.Nombre)
            .IsRequired()
            .HasMaxLength(50);

        // 3. Índices
        builder.HasIndex(m => m.Nombre)
            .IsUnique();
    }
}
