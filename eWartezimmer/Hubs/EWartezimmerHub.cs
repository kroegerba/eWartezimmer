using Microsoft.AspNetCore.SignalR;

namespace eWartezimmer.Hubs
{
    public class EWartezimmerHub(QueueManager queueManager) : Hub
    {
        private readonly QueueManager _queueManager = queueManager;

        public async Task SendMessage(string user, string message)
            => await Clients.All.SendAsync("ReceiveMessage", user, message);

        public async Task SendMessageToConnectionId(string connectionId, string message)
            => await Clients.Client(connectionId).SendAsync("ReceiveMessage", connectionId, message);

        /* public void RegisterAsNewQueuer(string name)
            => _queueManager.RegisterAsNewQueuer(connectionId: Context.ConnectionId, name: name); */

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            // _queueManager.UnregisterQueuer(Context.ConnectionId);
            await Task.CompletedTask;
        }

        public async Task TellMeAllQueuers() => 
            await Clients.Caller.SendAsync("AllQueuers", _queueManager.JsonListAllQueuers());

        public async Task CreatePatient(string name)
        {
            Patient patient = _queueManager.CreatePatient(name: name);
            await Task.CompletedTask;
        }

        public async Task ChangeName(string guid, string newName)
        {
            _queueManager.ChangePatientName(guid, newName);
            await Task.CompletedTask;
        }


    }
}