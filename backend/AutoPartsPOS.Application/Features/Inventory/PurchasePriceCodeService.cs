using AutoPartsPOS.Domain.Constants;

namespace AutoPartsPOS.Application.Features.Inventory;

public class PurchasePriceCodeService : IPurchasePriceCodeService
{
    public string Encode(decimal purchasePrice) => PurchasePriceCode.Encode(purchasePrice);
}
