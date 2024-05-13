namespace eWartezimmer
{
    public class Office(string guid)
    {
        public string Guid { get; } = guid;
        public string? Name { get; internal set; }
        public string? Address { get; internal set; }
        public string? Latitude { get; internal set; }
        public string? Longitude { get; internal set; }

        [NonSerialized]
        private List<Patient> _patientQueue = new();
    }
}