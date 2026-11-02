using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SGCS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddVarianteProveedor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "VariantesProveedores",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(36)", maxLength: 36, nullable: false),
                    IdVariante = table.Column<string>(type: "character varying(36)", maxLength: 36, nullable: false),
                    IdProveedor = table.Column<string>(type: "character varying(36)", maxLength: 36, nullable: false),
                    CodigoProveedor = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Costo = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VariantesProveedores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VariantesProveedores_Proveedores_IdProveedor",
                        column: x => x.IdProveedor,
                        principalTable: "Proveedores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VariantesProveedores_Variantes_IdVariante",
                        column: x => x.IdVariante,
                        principalTable: "Variantes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_VariantesProveedores_IdProveedor_CodigoProveedor",
                table: "VariantesProveedores",
                columns: new[] { "IdProveedor", "CodigoProveedor" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_VariantesProveedores_IdVariante_IdProveedor",
                table: "VariantesProveedores",
                columns: new[] { "IdVariante", "IdProveedor" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "VariantesProveedores");
        }
    }
}
