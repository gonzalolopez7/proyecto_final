using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SGCS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDepositoEstanteriaUbicacion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Depositos",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(36)", maxLength: 36, nullable: false),
                    Nombre = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Descripcion = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Depositos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Estanterias",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(36)", maxLength: 36, nullable: false),
                    IdDeposito = table.Column<string>(type: "character varying(36)", maxLength: 36, nullable: false),
                    Nombre = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Descripcion = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Estanterias", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Estanterias_Depositos_IdDeposito",
                        column: x => x.IdDeposito,
                        principalTable: "Depositos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Ubicaciones",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(36)", maxLength: 36, nullable: false),
                    IdVariante = table.Column<string>(type: "character varying(36)", maxLength: 36, nullable: false),
                    IdEstanteria = table.Column<string>(type: "character varying(36)", maxLength: 36, nullable: false),
                    Cantidad = table.Column<int>(type: "integer", nullable: false, defaultValue: 0)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ubicaciones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Ubicaciones_Estanterias_IdEstanteria",
                        column: x => x.IdEstanteria,
                        principalTable: "Estanterias",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Ubicaciones_Variantes_IdVariante",
                        column: x => x.IdVariante,
                        principalTable: "Variantes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Depositos_Nombre",
                table: "Depositos",
                column: "Nombre",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Estanterias_IdDeposito_Nombre",
                table: "Estanterias",
                columns: new[] { "IdDeposito", "Nombre" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Ubicaciones_IdEstanteria",
                table: "Ubicaciones",
                column: "IdEstanteria");

            migrationBuilder.CreateIndex(
                name: "IX_Ubicaciones_IdVariante_IdEstanteria",
                table: "Ubicaciones",
                columns: new[] { "IdVariante", "IdEstanteria" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Ubicaciones");

            migrationBuilder.DropTable(
                name: "Estanterias");

            migrationBuilder.DropTable(
                name: "Depositos");
        }
    }
}
