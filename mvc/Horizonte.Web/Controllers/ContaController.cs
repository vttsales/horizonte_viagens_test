using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace Horizonte.Web.Controllers;
public sealed class ContaController : Controller
{
    [AllowAnonymous] public IActionResult Entrar() => View();
    [AllowAnonymous] public IActionResult Cadastro() => View();
    [Authorize] public IActionResult Index() => View();
    [AllowAnonymous] public IActionResult AcessoRestrito() => StatusCode(403, "Acesso restrito.");
}
