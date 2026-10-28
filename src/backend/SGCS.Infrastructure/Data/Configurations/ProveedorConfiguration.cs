using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SGCS.Domain.Entities;

namespace SGCS.Infrastructure.Data.Configurations;

public class ProveedorConfiguration : IEntityTypeConfiguration<Proveedor>
{
    public void Configure(EntityTypeBuilder<Proveedor> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Id)
            .HasMaxLength(36);

        builder.Property(p => p.Nombre)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.RazonSocial)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.Cuit)
            .IsRequired()
            .HasMaxLength(11);

        builder.Property(p => p.Telefono)
            .HasMaxLength(20);

        builder.Property(p => p.Direccion)
            .HasMaxLength(500);

        builder.Property(p => p.Email)
            .HasMaxLength(256);

        builder.Property(p => p.DiasPago)
            .HasDefaultValue(0);

        builder.Property(p => p.SaldoInicial)
            .HasPrecision(18, 2);

        builder.Property(p => p.IsDeleted)
            .HasDefaultValue(false);

        builder.HasIndex(p => p.Cuit)
            .IsUnique();

    }
}