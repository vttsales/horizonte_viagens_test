using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace Horizonte.Web.Controllers;
[Authorize(Roles = "Admin")]
public sealed class AdministracaoController : Controller
{
    public IActionResult Index() => View();
}
