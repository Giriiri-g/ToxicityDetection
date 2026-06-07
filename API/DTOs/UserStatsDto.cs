namespace API.DTOs;

public record GrowthPointDto(string Month, int Count);

public record UserStatsDto(int TotalUsers, int NewThisMonth, List<GrowthPointDto> Growth);
