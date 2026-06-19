using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class AddToxicityConfig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ToxicityConfigs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    TagThresholdsJson = table.Column<string>(type: "TEXT", nullable: false),
                    BlurThreshold = table.Column<double>(type: "REAL", nullable: false),
                    BlockThreshold = table.Column<double>(type: "REAL", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ToxicityConfigs", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "ToxicityConfigs",
                columns: new[] { "Id", "BlockThreshold", "BlurThreshold", "TagThresholdsJson" },
                values: new object[] { 1, 70.0, 35.0, "{\"Hate\":35,\"Threat\":35,\"NSFW\":35,\"Spam\":35,\"Controversial\":35}" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ToxicityConfigs");
        }
    }
}
