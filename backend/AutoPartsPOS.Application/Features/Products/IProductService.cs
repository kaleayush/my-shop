using AutoPartsPOS.Application.Common;

namespace AutoPartsPOS.Application.Features.Products;

public interface IProductService
{
    Task<Result<List<ProductResponse>>> SearchAsync(ProductSearchRequest request, CancellationToken ct = default);
    Task<Result<ProductDetailResponse>> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Result<ProductDetailResponse>> CreateAsync(CreateProductRequest request, CancellationToken ct = default);
    Task<Result<ProductDetailResponse>> UpdateAsync(Guid id, UpdateProductRequest request, CancellationToken ct = default);
    Task<Result<ProductImageResponse>> AddImageAsync(Guid productId, AddProductImageRequest request, CancellationToken ct = default);
}
