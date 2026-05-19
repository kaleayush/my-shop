namespace AutoPartsPOS.Domain.Entities;

public class CustomerCredit : AuditableEntity
{
    public Guid ShopId { get; set; }
    public Guid SaleId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string? CustomerPhone { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal PendingAmount { get; set; }
    public string Status { get; set; } = "Pending";
}
