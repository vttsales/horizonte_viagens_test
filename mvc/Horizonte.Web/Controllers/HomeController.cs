using Microsoft.AspNetCore.Mvc;
namespace Horizonte.Web.Controllers;
public sealed class HomeController : Controller
{
    public IActionResult Index() => View();
}
