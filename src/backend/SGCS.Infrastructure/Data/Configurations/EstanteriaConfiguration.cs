using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SGCS.Domain.Entities;

namespace SGCS.Infrastructure.Data.Configurations;

public class EstanteriaConfiguration : IEntityTypeConfiguration<Estanteria>
{
    public void Configure(EntityTypeBuilder<Estanteria> builder)
    {
        // 1. Clave Primaria
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasMaxLength(36);

        // 2. Propiedades de Dominio
        builder.Property(e => e.IdDeposito)
            .IsRequired()
            .HasMaxLength(36);

        builder.Property(e => e.Nombre)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.Descripcion)
            .HasMaxLength(500);

        // 3. Soft Delete
        builder.Property(e => e.IsDeleted)
            .HasDefaultValue(false);

        builder.Property(e => e.DeletedBy)
            .HasMaxLength(36);

        // 4. Índices
        builder.HasIndex(e => new { e.IdDeposito, e.Nombre })
            .IsUnique();

        // 5. Relaciones
        builder.HasOne(e => e.Deposito)
            .WithMany()
            .HasForeignKey(e => e.IdDeposito)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
