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
    {
        return View();
    }

    //public IActionResult Customer()
    //{
    //    return View();
    //}

    // {id?}
    public IActionResult Patient(string? id)
    {
        if (id != null) {
            return View(model: new PatientViewModel { Patient = _queueManager.GetPatientByGuid(id) });
        } else {
            return View();

        }
        
    }
    public IActionResult Practice()
    {
        return View();
    }

    public IActionResult Office()
    {
        return View();
    }

    public IActionResult Privacy()
    {
        return View();
    }

    public IActionResult Reception()
    {
        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
