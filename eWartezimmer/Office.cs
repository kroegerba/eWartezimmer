namespace eWartezimmer
{
    public class Office(string guid)
    {
        public string Guid { get; } = guid;
        public string? Name { get; internal set; }
        public string? Address { get; internal set; }
        public string? Latitude { get; internal set; }
        public string? Longitude { get; internal set; }
        public string? Link { get; internal set; }
        public List<Patient> Queue { get; } = [];
        public string? ConnectionId { get; internal set; }
    }
}