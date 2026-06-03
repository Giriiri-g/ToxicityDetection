using API.DTOs;

namespace API.Interfaces;

public interface IPostService
{
    Task<PostResponseDto> CreatePost(string username, CreatePostDto dto);
    Task<List<PostResponseDto>> GetFeed(int page, int pageSize);
}
