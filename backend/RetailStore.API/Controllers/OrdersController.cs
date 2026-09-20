using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RetailStore.API.Data;
using RetailStore.API.Models;

namespace RetailStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly StoreDbContext _context;

        public OrdersController(StoreDbContext context)
        {
            _context = context;
        }

        public class CreateOrderItemDto
        {
            public int ProductId { get; set; }
            public int Quantity { get; set; }
        }

        public class CreateOrderDto
        {
            public int CustomerId { get; set; }
            public string ShippingAddress { get; set; } = string.Empty;
            public string PaymentMethod { get; set; } = "Credit Card";
            public List<CreateOrderItemDto> Items { get; set; } = new List<CreateOrderItemDto>();
        }

        public class StatusUpdateDto
        {
            public string Status { get; set; } = string.Empty;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.Items)
                .ThenInclude(i => i.Product)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            return Ok(orders);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserOrders(int userId)
        {
            var orders = await _context.Orders
                .Include(o => o.Items)
                .ThenInclude(i => i.Product)
                .Where(o => o.CustomerId == userId)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            return Ok(orders);
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
        {
            if (dto.Items == null || !dto.Items.Any())
                return BadRequest(new { message = "Order must contain at least one product." });

            var customer = await _context.Users.FindAsync(dto.CustomerId);
            if (customer == null)
                return BadRequest(new { message = "Customer not found." });

            decimal total = 0;
            var orderItems = new List<OrderItem>();

            foreach (var item in dto.Items)
            {
                var product = await _context.Products.FindAsync(item.ProductId);
                if (product == null) return BadRequest(new { message = $"Product ID {item.ProductId} not found." });
                if (product.StockQuantity < item.Quantity) return BadRequest(new { message = $"Insufficient stock for '{product.Name}'." });

                product.StockQuantity -= item.Quantity; // Deduct inventory
                decimal itemTotal = product.Price * item.Quantity;
                total += itemTotal;

                orderItems.Add(new OrderItem
                {
                    ProductId = product.Id,
                    Quantity = item.Quantity,
                    UnitPrice = product.Price
                });
            }

            var order = new Order
            {
                CustomerId = dto.CustomerId,
                TotalAmount = total,
                Status = "Pending",
                ShippingAddress = dto.ShippingAddress,
                PaymentMethod = dto.PaymentMethod,
                OrderDate = DateTime.UtcNow,
                Items = orderItems
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return Ok(order);
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] StatusUpdateDto dto)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return NotFound(new { message = "Order not found." });

            order.Status = dto.Status;
            await _context.SaveChangesAsync();

            return Ok(order);
        }
    }
}
