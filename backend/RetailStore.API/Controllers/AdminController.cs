using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RetailStore.API.Data;

namespace RetailStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly StoreDbContext _context;

        public AdminController(StoreDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var totalRevenue = await _context.Orders
                .Where(o => o.Status != "Cancelled")
                .SumAsync(o => (decimal?)o.TotalAmount) ?? 0;

            var totalOrders = await _context.Orders.CountAsync();
            var pendingOrders = await _context.Orders.CountAsync(o => o.Status == "Pending");
            var totalProducts = await _context.Products.CountAsync();
            var lowStockProducts = await _context.Products.CountAsync(p => p.StockQuantity <= 10);
            var totalCustomers = await _context.Users.CountAsync(u => u.Role == "Customer");

            return Ok(new
            {
                TotalRevenue = totalRevenue,
                TotalOrders = totalOrders,
                PendingOrders = pendingOrders,
                TotalProducts = totalProducts,
                LowStockProducts = lowStockProducts,
                TotalCustomers = totalCustomers
            });
        }
    }
}
