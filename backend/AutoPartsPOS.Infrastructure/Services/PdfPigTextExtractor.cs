using System.Text;
using AutoPartsPOS.Application.Interfaces.Services;
using UglyToad.PdfPig;
using UglyToad.PdfPig.Content;

namespace AutoPartsPOS.Infrastructure.Services;

public class PdfPigTextExtractor : IPdfTextExtractor
{
    public string ExtractText(byte[] pdfBytes)
    {
        try
        {
            using var document = PdfDocument.Open(pdfBytes);
            var sb = new StringBuilder();

            foreach (var page in document.GetPages())
            {
                var words = page.GetWords()
                    .OrderBy(w => -w.BoundingBox.Top)
                    .ThenBy(w => w.BoundingBox.Left)
                    .ToList();

                if (words.Count == 0) continue;

                foreach (var line in GroupIntoLines(words))
                    sb.AppendLine(string.Join(" ", line.Select(w => w.Text)));
            }

            return sb.ToString().Trim();
        }
        catch
        {
            return string.Empty;
        }
    }

    private static List<List<Word>> GroupIntoLines(List<Word> words, double tolerance = 3.0)
    {
        var lines = new List<List<Word>>();
        List<Word>? current = null;
        double lastY = double.MaxValue;

        foreach (var word in words)
        {
            var y = word.BoundingBox.Top;
            if (current is null || Math.Abs(y - lastY) > tolerance)
            {
                current = [];
                lines.Add(current);
                lastY = y;
            }
            current.Add(word);
        }

        return lines;
    }
}
