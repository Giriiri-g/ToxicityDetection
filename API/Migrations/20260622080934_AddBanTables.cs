using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class AddBanTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BanHistories",
                columns: table => new
                {
                    TID = table.Column<Guid>(type: "TEXT", nullable: false),
                    UID = table.Column<Guid>(type: "TEXT", nullable: false),
                    StartDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ExpiryDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Reason = table.Column<string>(type: "TEXT", nullable: false),
                    ModID = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BanHistories", x => x.TID);
                });

            migrationBuilder.CreateTable(
                name: "Bans",
                columns: table => new
                {
                    TID = table.Column<Guid>(type: "TEXT", nullable: false),
                    UID = table.Column<Guid>(type: "TEXT", nullable: false),
                    StartDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ExpiryDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Reason = table.Column<string>(type: "TEXT", nullable: false),
                    ModID = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bans", x => x.TID);
                    table.ForeignKey(
                        name: "FK_Bans_Users_ModID",
                        column: x => x.ModID,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Bans_Users_UID",
                        column: x => x.UID,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Posts_PPID",
                table: "Posts",
                column: "PPID");

            migrationBuilder.CreateIndex(
                name: "IX_Bans_ModID",
                table: "Bans",
                column: "ModID");

            migrationBuilder.CreateIndex(
                name: "IX_Bans_UID",
                table: "Bans",
                column: "UID");

            migrationBuilder.AddForeignKey(
                name: "FK_Posts_Posts_PPID",
                table: "Posts",
                column: "PPID",
                principalTable: "Posts",
                principalColumn: "PID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Posts_Posts_PPID",
                table: "Posts");

            migrationBuilder.DropTable(
                name: "BanHistories");

            migrationBuilder.DropTable(
                name: "Bans");

            migrationBuilder.DropIndex(
                name: "IX_Posts_PPID",
                table: "Posts");
        }
    }
}
