namespace eWartezimmer
{
    public class Patient(string guid)
    {
        
        public string Guid { get; } = guid;
        public string? Name { get; internal set; }
        public string? ConnectionId { get; internal set; }
        public int TurnInLine { get; internal set; }
        public int WaitingTime { get; internal set; }
        public int TreatmentDuration { get; internal set; } = 300;
        public int TreatmentTimeElapsed { get; internal set; } = 0;
        
    }
}