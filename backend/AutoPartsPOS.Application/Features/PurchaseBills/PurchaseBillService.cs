using System.Text.RegularExpressions;
using AutoPartsPOS.Application.Common;
using AutoPartsPOS.Application.Features.Inventory;
using AutoPartsPOS.Application.Interfaces;
using AutoPartsPOS.Application.Interfaces.Repositories;
using AutoPartsPOS.Application.Interfaces.Services;
using AutoPartsPOS.Domain.Entities;
using AutoPartsPOS.Domain.Enums;

namespace AutoPartsPOS.Application.Features.PurchaseBills;

public partial class PurchaseBillService : IPurchaseBillService
{
    private readonly IPurchaseBillRepository _purchaseBills;
    private readonly IProductRepository _products;
    private readonly IDealerRepository _dealers;
    private readonly IInventoryBatchRepository _batches;
    private readonly IPurchaseBillTextExtractor _textExtractor;
    private readonly IPurchasePriceCodeService _priceCode;
    private readonly ICurrentUserService _currentUser;
    private readonly IAppDbContext _context;

    public PurchaseBillService(
        IPurchaseBillRepository purchaseBills,
        IProductRepository products,
        IDealerRepository dealers,
        IInventoryBatchRepository batches,
        IPurchaseBillTextExtractor textExtractor,
        IPurchasePriceCodeService priceCode,
        ICurrentUserService currentUser,
        IAppDbContext context)
    {
        _purchaseBills = purchaseBills;
        _products = products;
        _dealers = dealers;
        _batches = batches;
        _textExtractor = textExtractor;
        _priceCode = priceCode;
        _currentUser = currentUser;
        _context = context;
    }

    public async Task<Result<PurchaseBillReviewResponse>> UploadAsync(UploadPurchaseBillRequest request, CancellationToken ct = default)
    {
        var dealer = await _dealers.GetByIdAsync(request.DealerId, _currentUser.ShopId, ct);
        if (dealer is null || !dealer.IsActive)
            return Result.Failure<PurchaseBillReviewResponse>("Dealer not found.");

        var extracted = await _textExtractor.ExtractAsync(request.FileContent, request.FileName, request.ContentType, ct);
        var parsedItems = ParseItems(extracted.Text);
        var items = new List<PurchaseBillItem>();

        foreach (var parsed in parsedItems)
        {
            var match = await FindProductMatchAsync(parsed.RawProductName, ct);
            items.Add(new PurchaseBillItem
            {
                ShopId = _currentUser.ShopId,
                RawProductName = parsed.RawProductName,
                Quantity = parsed.Quantity,
                MRP = parsed.MRP,
                PurchasePrice = parsed.PurchasePrice,
                ProductId = match.IsExact ? match.Product?.Id : null,
                SuggestedProductId = match.Product?.Id,
                MatchConfidence = match.Confidence,
                IsConfirmed = match.IsExact,
            });
        }

        var itemTotal = items.Sum(i => i.Quantity * i.PurchasePrice);
        var totalAmount = request.TotalAmount > 0 ? request.TotalAmount : itemTotal;
        var paidAmount = Math.Min(request.PaidAmount, totalAmount);

        var purchaseBill = new PurchaseBill
        {
            ShopId = _currentUser.ShopId,
            DealerId = request.DealerId,
            BillNumber = string.IsNullOrWhiteSpace(request.BillNumber)
                ? await GenerateBillNumberAsync(ct)
                : request.BillNumber.Trim(),
            BillDate = NormalizeDate(request.BillDate),
            UploadedFileUrl = request.FileName.Trim(),
            TotalAmount = totalAmount,
            PaidAmount = paidAmount,
            PendingAmount = totalAmount - paidAmount,
            Status = PurchaseBillStatus.ReviewPending,
            Items = items,
        };

        await _purchaseBills.AddAsync(purchaseBill, ct);
        await _context.SaveChangesAsync(ct);

        var created = await _purchaseBills.GetByIdWithItemsAsync(purchaseBill.Id, _currentUser.ShopId, ct);
        return Result.Success(Map(created!, extracted.Status, Truncate(extracted.Text)));
    }

    public async Task<Result<PurchaseBillReviewResponse>> GetReviewAsync(Guid id, CancellationToken ct = default)
    {
        var purchaseBill = await _purchaseBills.GetByIdWithItemsAsync(id, _currentUser.ShopId, ct);
        if (purchaseBill is null)
            return Result.Failure<PurchaseBillReviewResponse>("Purchase bill not found.");

        return Result.Success(Map(purchaseBill, "Review pending", null));
    }

    public async Task<Result<PurchaseBillItemResponse>> MapItemAsync(Guid purchaseBillId, MapPurchaseBillItemRequest request, CancellationToken ct = default)
    {
        var item = await _purchaseBills.GetItemAsync(purchaseBillId, request.PurchaseBillItemId, _currentUser.ShopId, ct);
        if (item is null)
            return Result.Failure<PurchaseBillItemResponse>("Purchase bill item not found.");

        var product = await _products.GetByIdAsync(request.ProductId, _currentUser.ShopId, ct);
        if (product is null || !product.IsActive)
            return Result.Failure<PurchaseBillItemResponse>("Product not found.");

        item.ProductId = product.Id;
        item.SuggestedProductId = product.Id;
        item.MatchConfidence = 1;
        item.IsConfirmed = true;

        await _context.SaveChangesAsync(ct);
        return Result.Success(MapItem(item));
    }

    public async Task<Result<PurchaseBillItemResponse>> CreateProductFromItemAsync(Guid purchaseBillId, CreateProductFromPurchaseBillItemRequest request, CancellationToken ct = default)
    {
        var item = await _purchaseBills.GetItemAsync(purchaseBillId, request.PurchaseBillItemId, _currentUser.ShopId, ct);
        if (item is null)
            return Result.Failure<PurchaseBillItemResponse>("Purchase bill item not found.");

        var product = new Product
        {
            ShopId = _currentUser.ShopId,
            ProductName = request.ProductName.Trim(),
            MRP = item.MRP,
            SearchKeywords = item.RawProductName,
            MinimumStockQuantity = request.MinimumStockQuantity,
            IsActive = true,
        };

        await _products.AddAsync(product, ct);
        item.ProductId = product.Id;
        item.SuggestedProductId = product.Id;
        item.MatchConfidence = 1;
        item.IsConfirmed = true;

        await _context.SaveChangesAsync(ct);

        var purchaseBill = await _purchaseBills.GetByIdWithItemsAsync(purchaseBillId, _currentUser.ShopId, ct);
        var createdItem = purchaseBill!.Items.First(x => x.Id == request.PurchaseBillItemId);
        return Result.Success(MapItem(createdItem));
    }

    public async Task<Result<PurchaseBillReviewResponse>> ConfirmAsync(Guid id, ConfirmPurchaseBillRequest request, CancellationToken ct = default)
    {
        var purchaseBill = await _purchaseBills.GetByIdWithItemsAsync(id, _currentUser.ShopId, ct);
        if (purchaseBill is null)
            return Result.Failure<PurchaseBillReviewResponse>("Purchase bill not found.");
        if (purchaseBill.Status == PurchaseBillStatus.Confirmed)
            return Result.Failure<PurchaseBillReviewResponse>("Purchase bill is already confirmed.");

        var existingItems = purchaseBill.Items.ToDictionary(x => x.Id);
        foreach (var requestItem in request.Items)
        {
            if (!existingItems.TryGetValue(requestItem.PurchaseBillItemId, out var item))
                return Result.Failure<PurchaseBillReviewResponse>("Purchase bill item not found.");

            var product = await _products.GetByIdAsync(requestItem.ProductId, _currentUser.ShopId, ct);
            if (product is null || !product.IsActive)
                return Result.Failure<PurchaseBillReviewResponse>($"Product not found for item {requestItem.RawProductName}.");

            item.ProductId = product.Id;
            item.RawProductName = requestItem.RawProductName.Trim();
            item.Quantity = requestItem.Quantity;
            item.MRP = requestItem.MRP;
            item.PurchasePrice = requestItem.PurchasePrice;
            item.SuggestedProductId = product.Id;
            item.MatchConfidence = 1;
            item.IsConfirmed = true;
        }

        if (purchaseBill.Items.Any(x => !x.IsConfirmed || x.ProductId is null))
            return Result.Failure<PurchaseBillReviewResponse>("All purchase bill items must be mapped before confirmation.");

        var totalAmount = purchaseBill.Items.Sum(x => x.Quantity * x.PurchasePrice);
        purchaseBill.TotalAmount = totalAmount;
        purchaseBill.PaidAmount = Math.Min(request.PaidAmount, totalAmount);
        purchaseBill.PendingAmount = totalAmount - purchaseBill.PaidAmount;
        purchaseBill.Status = PurchaseBillStatus.Confirmed;

        var nextBatchNumber = await _batches.CountByShopAsync(_currentUser.ShopId, ct) + 1;
        foreach (var item in purchaseBill.Items)
        {
            var batch = new InventoryBatch
            {
                ShopId = _currentUser.ShopId,
                ProductId = item.ProductId!.Value,
                DealerId = purchaseBill.DealerId,
                PurchaseBillId = purchaseBill.Id,
                PurchaseBillItemId = item.Id,
                BatchNumber = GenerateBatchNumber(nextBatchNumber++),
                MRP = item.MRP,
                PurchasePrice = item.PurchasePrice,
                PurchasePriceCode = _priceCode.Encode(item.PurchasePrice),
                InitialQuantity = item.Quantity,
                CurrentQuantity = item.Quantity,
                ReservedQuantity = 0,
                SoldQuantity = 0,
                DamagedQuantity = 0,
                MinimumStockQuantity = 0,
                PurchaseDate = purchaseBill.BillDate,
                IsActive = true,
            };

            await _batches.AddAsync(batch, ct);
        }

        await _context.SaveChangesAsync(ct);

        var confirmed = await _purchaseBills.GetByIdWithItemsAsync(id, _currentUser.ShopId, ct);
        return Result.Success(Map(confirmed!, "Confirmed and inventory batches created", null));
    }

    private async Task<ProductMatch> FindProductMatchAsync(string rawProductName, CancellationToken ct)
    {
        var candidates = await _products.SearchAsync(_currentUser.ShopId, rawProductName, null, null, false, ct);
        var normalizedRaw = NormalizeMatch(rawProductName);
        var exact = candidates.FirstOrDefault(x => NormalizeMatch(x.ProductName) == normalizedRaw);
        if (exact is not null)
            return new ProductMatch(exact, 1, true);

        var suggested = candidates.FirstOrDefault();
        return suggested is null
            ? new ProductMatch(null, 0, false)
            : new ProductMatch(suggested, 0.70m, false);
    }

    private async Task<string> GenerateBillNumberAsync(CancellationToken ct)
    {
        var count = await _purchaseBills.CountByShopAsync(_currentUser.ShopId, ct);
        return $"PB-{DateTime.UtcNow:yyyyMMdd}-{count + 1:0000}";
    }

    private static string GenerateBatchNumber(int number) =>
        $"BATCH-{DateTime.UtcNow:yyyyMMdd}-{number:0000}";

    private static List<ParsedPurchaseBillItem> ParseItems(string extractedText)
    {
        var items = new List<ParsedPurchaseBillItem>();
        if (string.IsNullOrWhiteSpace(extractedText))
            return items;

        foreach (var rawLine in extractedText.Split('\n', StringSplitOptions.RemoveEmptyEntries))
        {
            var line = rawLine.Trim();
            if (line.Length < 5)
                continue;

            var match = ItemLineRegex().Match(line);
            if (!match.Success)
                continue;

            items.Add(new ParsedPurchaseBillItem(
                match.Groups["name"].Value.Trim(' ', '-', ':'),
                int.Parse(match.Groups["qty"].Value),
                decimal.Parse(match.Groups["mrp"].Value),
                decimal.Parse(match.Groups["price"].Value)));
        }

        return items;
    }

    private static PurchaseBillReviewResponse Map(PurchaseBill bill, string extractionStatus, string? rawExtractedText) =>
        new(
            bill.Id,
            bill.DealerId,
            bill.Dealer.Name,
            bill.BillNumber,
            bill.BillDate,
            bill.UploadedFileUrl,
            bill.TotalAmount,
            bill.PaidAmount,
            bill.PendingAmount,
            bill.Status,
            extractionStatus,
            rawExtractedText,
            bill.Items.OrderBy(i => i.CreatedAt).Select(MapItem).ToList());

    private static PurchaseBillItemResponse MapItem(PurchaseBillItem item) =>
        new(
            item.Id,
            item.ProductId,
            item.Product?.ProductName,
            item.RawProductName,
            item.Quantity,
            item.MRP,
            item.PurchasePrice,
            item.SuggestedProductId,
            item.SuggestedProductId == item.ProductId ? item.Product?.ProductName : null,
            item.MatchConfidence,
            item.IsConfirmed);

    private static DateTime NormalizeDate(DateTime date) =>
        date.Kind == DateTimeKind.Unspecified
            ? DateTime.SpecifyKind(date, DateTimeKind.Utc)
            : date.ToUniversalTime();

    private static string NormalizeMatch(string value) =>
        string.Join(' ', value.Trim().ToLowerInvariant().Split(' ', StringSplitOptions.RemoveEmptyEntries));

    private static string? Truncate(string value) =>
        string.IsNullOrWhiteSpace(value)
            ? null
            : value.Length <= 4000 ? value : value[..4000];

    [GeneratedRegex(@"^(?<name>.+?)(?:\s{2,}|,|\|)\s*(?<qty>\d+)(?:\s+|,|\|)(?<mrp>\d+(?:\.\d{1,2})?)(?:\s+|,|\|)(?<price>\d+(?:\.\d{1,2})?)$", RegexOptions.Compiled)]
    private static partial Regex ItemLineRegex();

    private record ParsedPurchaseBillItem(string RawProductName, int Quantity, decimal MRP, decimal PurchasePrice);
    private record ProductMatch(Product? Product, decimal Confidence, bool IsExact);
}
