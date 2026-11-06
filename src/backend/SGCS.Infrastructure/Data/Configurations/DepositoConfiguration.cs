using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SGCS.Domain.Entities;

namespace SGCS.Infrastructure.Data.Configurations;

public class DepositoConfiguration : IEntityTypeConfiguration<Deposito>
{
    public void Configure(EntityTypeBuilder<Deposito> builder)
    {
        builder.HasKey(d => d.Id);
        builder.Property(d => d.Id).HasMaxLength(36);
        builder.Property(d => d.Nombre).IsRequired().HasMaxLength(150);
        builder.Property(d => d.Descripcion).HasMaxLength(500);
        builder.Property(d => d.Activo).HasDefaultValue(true);
        builder.Property(d => d.IsDeleted).HasDefaultValue(false);

        builder.HasIndex(d => d.Nombre).IsUnique();
    }
}