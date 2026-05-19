using AutoPartsPOS.Application.Common;

namespace AutoPartsPOS.API.Common;

/// <summary>
/// Standard API response envelope for all endpoints.
/// </summary>
public sealed class ApiResponse<T>
{
    public int StatusCode { get; init; }
    public string Message { get; init; } = string.Empty;
    public T? Data { get; init; }
    public bool IsSuccess { get; init; }
    public DateTime UtcTimestamp { get; init; }
    public IReadOnlyList<string>? Errors { get; init; }

    public static ApiResponse<T> Success(T data, string message = "Success", int statusCode = 200)
        => new()
        {
            StatusCode = statusCode,
            Message = message,
            Data = data,
            IsSuccess = true,
            UtcTimestamp = DateTime.UtcNow
        };

    public static ApiResponse<T> Fail(string message, int statusCode = 400, IEnumerable<string>? errors = null)
        => new()
        {
            StatusCode = statusCode,
            Message = message,
            Data = default,
            IsSuccess = false,
            UtcTimestamp = DateTime.UtcNow,
            Errors = errors?.ToList()
        };
}

/// <summary>
/// Pagination metadata + items, used as Data inside ApiResponse&lt;PagedResponse&lt;T&gt;&gt;.
/// </summary>
public sealed class PagedResponse<T>
{
    public IReadOnlyList<T> Items { get; init; } = [];
    public int TotalCount { get; init; }
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int TotalPages { get; init; }
    public bool HasNextPage { get; init; }
    public bool HasPreviousPage { get; init; }

    public static PagedResponse<T> From(PagedResult<T> result)
        => new()
        {
            Items = result.Items,
            TotalCount = result.TotalCount,
            Page = result.Page,
            PageSize = result.PageSize,
            TotalPages = result.TotalPages,
            HasNextPage = result.HasNextPage,
            HasPreviousPage = result.HasPreviousPage
        };
}
