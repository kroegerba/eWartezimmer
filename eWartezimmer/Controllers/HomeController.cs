using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using eWartezimmer.Models;

namespace eWartezimmer.Controllers;

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;
    private readonly QueueManager _queueManager;

    public HomeController(ILogger<HomeController> logger, QueueManager queueManager)
    {
        _logger = logger;
        _queueManager = queueManager;
    }

    public IActionResult Index()
        => View();

    public IActionResult QrCode(string? id)
        => View(model: new QrCodeViewModel { BaseUrl = _queueManager.BaseUrl, Patient = _queueManager.GetPatientByGuid(id) });

    public IActionResult Patient(string? id)
        => View(model: new PatientViewModel { Patient = _queueManager.GetPatientByGuid(id) });

    public IActionResult Admin(string? id)
        => View(model: new AdminViewModel { BaseUrl = _queueManager.BaseUrl, IsAdmin = _queueManager.IsAdminKey(id) });

    public IActionResult Office(string? id)
        => View(model: new OfficeViewModel { BaseUrl = _queueManager.BaseUrl, Office = _queueManager.GetOfficeByGuid(id) });

    public IActionResult Privacy()
        => View();

    public IActionResult Reception()
        => View();

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
        => View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });

}