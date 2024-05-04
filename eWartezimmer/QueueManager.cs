using System.Collections.Concurrent;
using System.Text.Json;
using eWartezimmer.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace eWartezimmer
{
    public class QueueManager
    {
        private readonly Timer _timer;
        private readonly IHubContext<EWartezimmerHub> _hubContext;
        private readonly List<Patient> _queue = new();

        public QueueManager(IHubContext<EWartezimmerHub> hubContext)
        {
            _hubContext = hubContext;
            _timer = new Timer(
                      async _ => await UpdateTickAsync(),
                      null,
                      TimeSpan.Zero,
                      TimeSpan.FromMilliseconds(1000));
        }

        internal async Task UpdateTickAsync()
        {
            await _hubContext.Clients.All.SendAsync("AllQueuers", JsonListAllQueuers());
        }

        internal string JsonListAllQueuers()
            => JsonSerializer.Serialize(_queue);

        internal void RegisterAsNewQueuer(string connectionId, string? name)
        {
            if (!string.IsNullOrEmpty(name))
            {
                _queue.Add(new Patient(guid: Guid.NewGuid().ToString(), name: name, connectionId: connectionId)
                {
                    TurnInLine = TakeTurnInLineNumber(),
                });
            }
        }

        private int TakeTurnInLineNumber()
        {
            Patient? patientWithHighestTurnInLine = _queue.OrderByDescending(p => p.TurnInLine).FirstOrDefault();
            return patientWithHighestTurnInLine != null ? patientWithHighestTurnInLine.TurnInLine + 1 : 0;
        }

        internal void UnregisterQueuer(string connectionId)
        {
            var candidate = _queue.SingleOrDefault(p => p.ConnectionId != null && p.ConnectionId.Equals(connectionId));
            if (candidate != null)
            {
                _queue.Remove(candidate);
                // Decrease the turn in line for each patient after the departed patient
                foreach (var patient in _queue)
                {
                    if (patient.TurnInLine > candidate.TurnInLine)
                    {
                        patient.TurnInLine--;
                    }
                }
            }
        }
    }
}
