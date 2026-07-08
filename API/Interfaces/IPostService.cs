using API.DTOs;

namespace API.Interfaces;

public interface IPostService
{
    Task<PostResponseDto> CreatePost(string username, CreatePostDto dto);
    Task<List<PostResponseDto>> GetFeed(int page, int pageSize, Guid? userId = null, string? thread = null);
    Task<PostResponseDto?> GetPostById(Guid postId);
    Task<List<PostResponseDto>> GetCommentsForPost(Guid postId);
    Task<List<ThreadCountDto>> GetThreadCounts();
    Task LikePost(Guid PID, Guid UID);
    Task UnLikePost(Guid PID, Guid UID);
}
