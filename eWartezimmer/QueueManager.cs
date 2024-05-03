using System.Collections.Concurrent;
using System.Text.Json;

namespace eWartezimmer
{
    public class QueueManager
    {
        private readonly ConcurrentDictionary<string, Patient> _queue = new();

        internal string JsonListAllQueuers()
            => JsonSerializer.Serialize(_queue);

        internal bool RegisterAsNewQueuer(string connectionId, string? name)
            => !string.IsNullOrEmpty(name) 
                && _queue.TryAdd(connectionId,
                    new Patient(guid: Guid.NewGuid().ToString(), name: name, connectionId: connectionId)
                    {
                        Name = name,
                        ConnectionId = connectionId
                    });

        internal bool UnregisterQueuer(string connectionId)
            => _queue.TryRemove(connectionId, out _);
    }
}