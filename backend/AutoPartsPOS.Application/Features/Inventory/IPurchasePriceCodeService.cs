namespace AutoPartsPOS.Application.Features.Inventory;

public interface IPurchasePriceCodeService
{
    string Encode(decimal purchasePrice);
}
