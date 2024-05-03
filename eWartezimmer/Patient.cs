namespace eWartezimmer
{
    internal class Patient(string guid, string name)
    {
        public Patient(string guid, string name, string connectionId) : this(guid, name)
        {
            Guid = guid;
            Name = name;
            ConnectionId = connectionId;
        }

        public string Guid { get; } = guid;
        public string Name { get; internal set; } = name;
        public string? ConnectionId { get; internal set; }
        public int TurnInLine { get; internal set; } = 0;
        public int WaitingTime { get; internal set; } = 0;
        public int TreatmentDuration { get; internal set; } = 0;
        public int TreatmentTimeElapsed { get; internal set; } = 0;
        
    }
}