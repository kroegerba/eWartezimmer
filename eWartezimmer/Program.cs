using System.Net;
using System.Net.NetworkInformation;
using eWartezimmer;
using eWartezimmer.Hubs;
using Microsoft.AspNetCore.SignalR;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddSignalR();

var addressBaseUrl = "https://eWartezimmer.com";

#if (DEBUG)
{
    Dictionary<char, string?> addressBaseUrls = Enumerable.Range('A', 26)
                                                          .Select(Convert.ToChar)
                                                          .ToDictionary(c => c, _ => (string?)null);
    
    foreach (NetworkInterface networkInterface in NetworkInterface.GetAllNetworkInterfaces())
    {
        // Filter out loopback and other non-usable interfaces
        if (networkInterface.OperationalStatus == OperationalStatus.Up &&
            networkInterface.NetworkInterfaceType != NetworkInterfaceType.Loopback &&
            networkInterface.NetworkInterfaceType != NetworkInterfaceType.Tunnel)
        {
            // Get IP properties for the current interface
            IPInterfaceProperties ipProperties = networkInterface.GetIPProperties();
            
            // Get IPv4 addresses for the current interface
            IPAddress[] ipv4Addresses = ipProperties.UnicastAddresses
                .Where(addr => addr.Address.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork)
                .Select(addr => addr.Address)
                .ToArray();
            
            // Assign IPv4 addresses to choices for list from A - Z
            foreach (IPAddress address in ipv4Addresses)
            {
                addressBaseUrls[addressBaseUrls.FirstOrDefault(kv => kv.Value == null).Key] = address.ToString();
            }
        }
    }
    
    if (addressBaseUrls.Values.Count(s => s != null) != 1)
    {
        foreach (var url in addressBaseUrls.Where(kv => kv.Value != null))
        {
            Console.WriteLine(url.Key + " : " + url.Value);
        }
        Console.WriteLine("Wählen Sie eine Base Url: ");
        var inputLine = Console.ReadLine();
        var candidate = addressBaseUrls.Where(kv => kv.Key.ToString().Equals(inputLine));
        if (candidate.Count() == 1)
        {
            addressBaseUrl = candidate.Single().Value;
        }
        else
        {
            Console.WriteLine("never mind, picking default:");
        }
        }
        else
        {
            addressBaseUrl = addressBaseUrls.First(kv => kv.Value != null).Value;
        }
        addressBaseUrl = "https://" + addressBaseUrl + ":7016";
        Console.WriteLine("Base URL: " + addressBaseUrl);
}
#endif

builder.Services.AddSingleton<QueueManager>(sp =>
{
    var hubContext = sp.GetRequiredService<IHubContext<EWartezimmerHub>>();
    return new QueueManager(hubContext, addressBaseUrl);
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.MapHub<EWartezimmerHub>("/eWartezimmerHub");




app.Run();