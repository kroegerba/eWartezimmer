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

        public async Task SetConnectionId(string guid)
        {
            _queueManager.SetConnectionId(guid, Context.ConnectionId);
            await Task.CompletedTask;
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var office = _queueManager.Disconnect(connectionId: Context.ConnectionId);
            // _queueManager.UnregisterQueuer(Context.ConnectionId);
            await Task.CompletedTask;
        }

        public async Task CreatePatient(string guid, string name)
        {
            Office? office = _queueManager.GetOfficeByGuid(guid);
            if (office != null)
            {
                Patient patient = _queueManager.CreatePatient(office: office, name: name);
            }
            await Task.CompletedTask;
        }

        public async Task CreateOffice(string name)
        {
            Office office = _queueManager.CreateOffice(name: name);
            await Task.CompletedTask;
        }

        public async Task ChangeName(string guid, string newName)
        {
            _queueManager.ChangePatientName(guid, newName);
            await Task.CompletedTask;
        }

        public async Task ChangeTreatmentDuration(string guid, string newTreatmentDuration)
        {
            _queueManager.ChangeTreatmentDuration(guid, newTreatmentDuration);
            await Task.CompletedTask;
        }
                public async Task ChangeOfficeName(string guid, string newName)
        {
            _queueManager.ChangeOfficeName(guid, newName);
            await Task.CompletedTask;
        }

        public async Task ChangeOfficeLocation(string guid, string address, string latitude, string longitude)
        {
            _queueManager.ChangeOfficeLocation(guid, address, latitude, longitude);
            await Task.CompletedTask;
        }
        
        public async Task UpdateUserLocation(double lat, double lng)
        {
            await Clients.All.SendAsync("UserLocationUpdated", lat, lng);
        }

    }
}