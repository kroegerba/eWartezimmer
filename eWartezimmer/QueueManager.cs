using System.Collections.Concurrent;
using System.Text.Json;

namespace eWartezimmer
{
    public class QueueManager
    {
        private readonly List<Patient> _queue = new();

        internal string JsonListAllQueuers()
            => JsonSerializer.Serialize(_queue);

        internal void RegisterAsNewQueuer(string connectionId, string? name)
        {
            if (!string.IsNullOrEmpty(name)) {
                _queue.Add(new Patient(guid: Guid.NewGuid().ToString(), name: name, connectionId: connectionId));
            }
        }


        internal void UnregisterQueuer(string connectionId)
        {
            var candidate = _queue.SingleOrDefault(p => p.ConnectionId != null && p.ConnectionId.Equals(connectionId));
            if (candidate != null) {
                _queue.Remove(candidate);
            }
        }
    }
}