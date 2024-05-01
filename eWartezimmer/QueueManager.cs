using System.Collections.Concurrent;

namespace eWartezimmer
{
    public class QueueManager
    {
        private readonly ConcurrentDictionary<string, Patient> _queue = new();
        internal void RegisterAsNewQueuer(string connectionId, string name)
        {
            if(_queue.TryAdd(connectionId, new Patient(name)))
            {
                // successful           
            } else {
                // already in queue
            }     
        }

        internal void UnregisterQueuer(string connectionId)
        {
            if(_queue.TryRemove(connectionId, out var patient))
            {
                // successful
            } else {
                // already out of queue
            }
        }
    }
}