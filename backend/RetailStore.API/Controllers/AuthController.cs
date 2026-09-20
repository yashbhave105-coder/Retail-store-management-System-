using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RetailStore.API.Data;
using RetailStore.API.Models;

namespace RetailStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly StoreDbContext _context;

        public AuthController(StoreDbContext context)
        {
            _context = context;
        }

        public class LoginRequest
        {
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
            public string RequestedRole { get; set; } = "Customer"; // Customer or Admin
        }

        public class RegisterRequest
        {
            public string FullName { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
            public string Role { get; set; } = "Customer";
            public string? Phone { get; set; }
            public string? Address { get; set; }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

            if (user == null || user.PasswordHash != request.Password)
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            if (!string.IsNullOrEmpty(request.RequestedRole) && 
                !user.Role.Equals(request.RequestedRole, StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = $"Account role mismatch. Account is '{user.Role}', but '{request.RequestedRole}' login was selected." });
            }

            return Ok(new
            {
                token = $"fake-jwt-token-{user.Id}-{user.Role.ToLower()}",
                user = new
                {
                    user.Id,
                    user.FullName,
                    user.Email,
                    user.Role,
                    user.Phone,
                    user.Address
                }
            });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            var existingUser = await _context.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower());
            if (existingUser)
            {
                return BadRequest(new { message = "Email is already registered." });
            }

            var user = new User
            {
                FullName = request.FullName,
                Email = request.Email,
                PasswordHash = request.Password, // Production app should hash password
                Role = request.Role == "Admin" ? "Admin" : "Customer",
                Phone = request.Phone,
                Address = request.Address
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Registration successful!",
                user = new
                {
                    user.Id,
                    user.FullName,
                    user.Email,
                    user.Role
                }
            });
        }
    }
}
