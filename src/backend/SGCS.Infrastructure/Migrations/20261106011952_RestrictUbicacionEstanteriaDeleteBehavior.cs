using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SGCS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RestrictUbicacionEstanteriaDeleteBehavior : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Ubicaciones_Estanterias_IdEstanteria",
                table: "Ubicaciones");

            migrationBuilder.AddForeignKey(
                name: "FK_Ubicaciones_Estanterias_IdEstanteria",
                table: "Ubicaciones",
                column: "IdEstanteria",
                principalTable: "Estanterias",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Ubicaciones_Estanterias_IdEstanteria",
                table: "Ubicaciones");

            migrationBuilder.AddForeignKey(
                name: "FK_Ubicaciones_Estanterias_IdEstanteria",
                table: "Ubicaciones",
                column: "IdEstanteria",
                principalTable: "Estanterias",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
