namespace AutoPartsPOS.Domain.Constants;

public static class PurchasePriceCode
{
    private static readonly Dictionary<char, char> DigitToCode = new()
    {
        { '0', 'A' }, { '1', 'B' }, { '2', 'C' }, { '3', 'D' }, { '4', 'E' },
        { '5', 'F' }, { '6', 'G' }, { '7', 'H' }, { '8', 'I' }, { '9', 'O' }
    };

    public static string Encode(decimal price)
    {
        var digits = ((int)price).ToString();
        return new string(digits.Select(d => DigitToCode[d]).ToArray());
    }
}
