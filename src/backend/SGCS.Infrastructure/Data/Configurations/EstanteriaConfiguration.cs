using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SGCS.Domain.Entities;

namespace SGCS.Infrastructure.Data.Configurations;
public class EstanteriaConfiguration : IEntityTypeConfiguration<Estanteria>
{
    public void Configure(EntityTypeBuilder<Estanteria> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasMaxLength(36);
        builder.Property(e => e.IdDeposito).IsRequired().HasMaxLength(36);
        builder.Property(e => e.Nombre).IsRequired().HasMaxLength(100);
        builder.Property(e => e.Descripcion).HasMaxLength(500);
        builder.Property(e => e.IsDeleted).HasDefaultValue(false);
        builder.HasOne(e => e.Deposito)
            .WithMany(d => d.Estanterias)
            .HasForeignKey(e => e.IdDeposito)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(e => new { e.IdDeposito, e.Nombre }).IsUnique();
        builder.HasQueryFilter(e =>!e.IsDeleted && !e.Deposito.IsDeleted);
    }

}