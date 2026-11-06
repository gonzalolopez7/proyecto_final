using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SGCS.Domain.Entities;

namespace SGCS.Infrastructure.Data.Configurations;

public class DepositoConfiguration : IEntityTypeConfiguration<Deposito>
{
    public void Configure(EntityTypeBuilder<Deposito> builder)
    {
        // 1. Clave Primaria
        builder.HasKey(d => d.Id);
        builder.Property(d => d.Id).HasMaxLength(36);

        // 2. Propiedades de Dominio
        builder.Property(d => d.Nombre)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(d => d.Descripcion)
            .HasMaxLength(500);

        // 3. Soft Delete
        builder.Property(d => d.IsDeleted)
            .HasDefaultValue(false);

        builder.Property(d => d.DeletedBy)
            .HasMaxLength(36);

        // 4. Índices
        builder.HasIndex(d => d.Nombre)
            .IsUnique();
    }
}
