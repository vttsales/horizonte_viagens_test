using System.Security.Claims;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Mvc;
namespace Horizonte.Web.Controllers;

// Contrato de integração, sem acesso ao SQL nem regras de negócio neste controller.
[Route("interface")]
public sealed class InterfaceController(IAntiforgery antiforgery) : Controller
{
    [HttpGet("csrf")]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public IActionResult Csrf() => Json(new { token = antiforgery.GetAndStoreTokens(HttpContext).RequestToken });

    [HttpGet("auth/session")]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public IActionResult Session()
    {
        if (User.Identity?.IsAuthenticated != true) return Json(new { user = (object?)null });
        return Json(new { user = new {
            id = User.FindFirstValue(ClaimTypes.NameIdentifier),
            name = User.Identity.Name,
            email = User.FindFirstValue(ClaimTypes.Email),
            role = User.IsInRole("Admin") ? "Admin" : "Cliente"
        }});
    }

    // Remover/substituir este fallback conforme os endpoints forem implementados.
    // Cada endpoint privado real exige [Authorize] e os administrativos exigem papel Admin.
    [Route("{**path}", Order = 1000)]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public IActionResult Pending() => StatusCode(503, new { message = "Serviço indisponível no momento." });
}
