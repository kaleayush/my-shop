using AutoPartsPOS.Application.Common;

namespace AutoPartsPOS.Application.Features.PurchaseBills;

public interface IPurchaseBillService
{
    Task<Result<PurchaseBillReviewResponse>> UploadAsync(UploadPurchaseBillRequest request, CancellationToken ct = default);
    Task<Result<PurchaseBillReviewResponse>> GetReviewAsync(Guid id, CancellationToken ct = default);
    Task<Result<PurchaseBillItemResponse>> MapItemAsync(Guid purchaseBillId, MapPurchaseBillItemRequest request, CancellationToken ct = default);
    Task<Result<PurchaseBillItemResponse>> CreateProductFromItemAsync(Guid purchaseBillId, CreateProductFromPurchaseBillItemRequest request, CancellationToken ct = default);
    Task<Result<PurchaseBillReviewResponse>> ConfirmAsync(Guid id, ConfirmPurchaseBillRequest request, CancellationToken ct = default);
}
