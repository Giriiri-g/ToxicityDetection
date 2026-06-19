using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class AddThreadToExistingPosts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE Posts
                SET Thread = 'General'
                WHERE Thread IS NULL
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // No down action as we are setting a default value for existing NULLs
            // If needed, we could set Thread back to NULL, but that would affect any posts that were intentionally set to 'General'
        }
    }
}