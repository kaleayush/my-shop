using AutoPartsPOS.Application.Common;

namespace AutoPartsPOS.Application.Features.Pos;

public interface IPosService
{
    Task<Result<DraftSaleResponse>> CreateDraftAsync(CreateDraftSaleRequest request, CancellationToken ct = default);
    Task<Result<List<DraftSaleResponse>>> GetActiveDraftsAsync(CancellationToken ct = default);
    Task<Result<DraftSaleResponse>> GetDraftAsync(Guid draftSaleId, CancellationToken ct = default);
    Task<Result<DraftSaleResponse>> AddItemAsync(Guid draftSaleId, AddDraftSaleItemRequest request, CancellationToken ct = default);
    Task<Result<DraftSaleResponse>> UpdateItemAsync(Guid draftSaleId, Guid itemId, UpdateDraftSaleItemRequest request, CancellationToken ct = default);
    Task<Result<DraftSaleResponse>> RemoveItemAsync(Guid draftSaleId, Guid itemId, CancellationToken ct = default);
    Task<Result<DraftSaleResponse>> HoldAsync(Guid draftSaleId, CancellationToken ct = default);
    Task<Result<DraftSaleResponse>> CancelAsync(Guid draftSaleId, CancellationToken ct = default);
    Task<Result<SaleResponse>> CompleteAsync(Guid draftSaleId, CompleteDraftSaleRequest request, CancellationToken ct = default);
    Task<Result<SaleResponse>> GetSaleAsync(Guid saleId, CancellationToken ct = default);
}
