using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SGCS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddVarianteColorTalle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "DeletedBy",
                table: "Productos",
                type: "character varying(36)",
                maxLength: 36,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(256)",
                oldMaxLength: 256,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IdEscalaTalle",
                table: "Productos",
                type: "character varying(36)",
                maxLength: 36,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "Colores",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(36)", maxLength: 36, nullable: false),
                    Nombre = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CodigoHex = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false),
                    Codigo = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Colores", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EscalasTalles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(36)", maxLength: 36, nullable: false),
                    Nombre = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EscalasTalles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Talles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(36)", maxLength: 36, nullable: false),
                    IdEscalaTalle = table.Column<string>(type: "character varying(36)", maxLength: 36, nullable: false),
                    Nombre = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Orden = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Talles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Talles_EscalasTalles_IdEscalaTalle",
                        column: x => x.IdEscalaTalle,
                        principalTable: "EscalasTalles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Variantes",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(36)", maxLength: 36, nullable: false),
                    IdProducto = table.Column<string>(type: "character varying(36)", maxLength: 36, nullable: false),
                    Sku = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    IdTalle = table.Column<string>(type: "character varying(36)", maxLength: 36, nullable: false),
                    IdColor = table.Column<string>(type: "character varying(36)", maxLength: 36, nullable: false),
                    StockMinimo = table.Column<int>(type: "integer", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<string>(type: "character varying(36)", maxLength: 36, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Variantes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Variantes_Colores_IdColor",
                        column: x => x.IdColor,
                        principalTable: "Colores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Variantes_Productos_IdProducto",
                        column: x => x.IdProducto,
                        principalTable: "Productos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Variantes_Talles_IdTalle",
                        column: x => x.IdTalle,
                        principalTable: "Talles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Productos_IdEscalaTalle",
                table: "Productos",
                column: "IdEscalaTalle");

            migrationBuilder.CreateIndex(
                name: "IX_Colores_Codigo",
                table: "Colores",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Colores_Nombre",
                table: "Colores",
                column: "Nombre",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EscalasTalles_Nombre",
                table: "EscalasTalles",
                column: "Nombre",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Talles_IdEscalaTalle_Nombre",
                table: "Talles",
                columns: new[] { "IdEscalaTalle", "Nombre" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Variantes_IdColor",
                table: "Variantes",
                column: "IdColor");

            migrationBuilder.CreateIndex(
                name: "IX_Variantes_IdProducto_IdTalle_IdColor",
                table: "Variantes",
                columns: new[] { "IdProducto", "IdTalle", "IdColor" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Variantes_IdTalle",
                table: "Variantes",
                column: "IdTalle");

            migrationBuilder.CreateIndex(
                name: "IX_Variantes_Sku",
                table: "Variantes",
                column: "Sku",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Productos_EscalasTalles_IdEscalaTalle",
                table: "Productos",
                column: "IdEscalaTalle",
                principalTable: "EscalasTalles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Productos_EscalasTalles_IdEscalaTalle",
                table: "Productos");

            migrationBuilder.DropTable(
                name: "Variantes");

            migrationBuilder.DropTable(
                name: "Colores");

            migrationBuilder.DropTable(
                name: "Talles");

            migrationBuilder.DropTable(
                name: "EscalasTalles");

            migrationBuilder.DropIndex(
                name: "IX_Productos_IdEscalaTalle",
                table: "Productos");

            migrationBuilder.DropColumn(
                name: "IdEscalaTalle",
                table: "Productos");

            migrationBuilder.AlterColumn<string>(
                name: "DeletedBy",
                table: "Productos",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(36)",
                oldMaxLength: 36,
                oldNullable: true);
        }
    }
}
