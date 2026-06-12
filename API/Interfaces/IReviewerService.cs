using API.DTOs;

namespace API.Interfaces;

public interface IReviewerService
{
    Task<(List<ReviewPostDto> posts, int totalCount)> GetFlaggedPosts(int page, int pageSize);
    Task<ReviewPostDetailDto?> GetPostDetail(Guid id);
    Task<(bool success, string message)> ReviewPost(Guid id, ReviewActionDto dto);
}
