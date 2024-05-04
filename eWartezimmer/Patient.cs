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
        public int TurnInLine { get; internal set; }
        public int WaitingTime { get; internal set; } = int.MaxValue;
        public int TreatmentDuration { get; internal set; } = int.MaxValue;
        public int TreatmentTimeElapsed { get; internal set; } = 0;
        
    }
}