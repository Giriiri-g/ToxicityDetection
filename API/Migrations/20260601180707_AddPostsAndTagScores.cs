using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class AddPostsAndTagScores : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddUniqueConstraint(
                name: "AK_Users_UserName",
                table: "Users",
                column: "UserName");

            migrationBuilder.CreateTable(
                name: "Posts",
                columns: table => new
                {
                    PID = table.Column<Guid>(type: "TEXT", nullable: false),
                    PPID = table.Column<Guid>(type: "TEXT", nullable: true),
                    UserName = table.Column<string>(type: "TEXT", nullable: false),
                    Title = table.Column<string>(type: "TEXT", nullable: true),
                    Message = table.Column<string>(type: "TEXT", nullable: false),
                    MediaUrl = table.Column<string>(type: "TEXT", nullable: true),
                    LinkUrl = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    LikesCount = table.Column<int>(type: "INTEGER", nullable: false),
                    SharesCount = table.Column<int>(type: "INTEGER", nullable: false),
                    CommentsCount = table.Column<int>(type: "INTEGER", nullable: false),
                    TotalToxicityScore = table.Column<double>(type: "REAL", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Posts", x => x.PID);
                    table.ForeignKey(
                        name: "FK_Posts_Users_UserName",
                        column: x => x.UserName,
                        principalTable: "Users",
                        principalColumn: "UserName",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TagScores",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    PostId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Tag = table.Column<string>(type: "TEXT", nullable: false),
                    Score = table.Column<double>(type: "REAL", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TagScores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TagScores_Posts_PostId",
                        column: x => x.PostId,
                        principalTable: "Posts",
                        principalColumn: "PID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Posts_UserName",
                table: "Posts",
                column: "UserName");

            migrationBuilder.CreateIndex(
                name: "IX_TagScores_PostId",
                table: "TagScores",
                column: "PostId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TagScores");

            migrationBuilder.DropTable(
                name: "Posts");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_Users_UserName",
                table: "Users");
        }
    }
}
