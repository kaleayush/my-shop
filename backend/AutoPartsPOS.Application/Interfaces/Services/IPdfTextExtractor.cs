namespace AutoPartsPOS.Application.Interfaces.Services;

public interface IPdfTextExtractor
{
    string ExtractText(byte[] pdfBytes);
}
