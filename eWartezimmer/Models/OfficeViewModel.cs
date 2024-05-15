namespace eWartezimmer.Models;

public class OfficeViewModel
{
    public Office? Office { get; set; }
    public string BaseUrl { get; internal set; } = string.Empty;
}
