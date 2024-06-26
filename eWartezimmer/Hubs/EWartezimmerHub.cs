using Microsoft.AspNetCore.SignalR;

namespace eWartezimmer.Hubs
{
    public class EWartezimmerHub(QueueManager queueManager) : Hub
    {
        private readonly QueueManager _queueManager = queueManager;

        public async Task SendMessageToOffice(string message)
        {
            var patient = _queueManager.GetPatientByConnectionId(Context.ConnectionId);
            var office = _queueManager.GetOfficeByPatient(patient);
            if (patient != null && office != null && office.ConnectionId != null && !string.IsNullOrEmpty(message)) {
                await Clients.Client(office.ConnectionId).SendAsync("ReceiveMessage", patient.Guid, message);
                foreach (var connectionId in patient.ConnectionIds) {
                    await Clients.Client(connectionId).SendAsync("ReceiveMessage", "self", message);
                }
            } else {
                await Task.CompletedTask;
            }
        }

        public async Task SendMessageToPatient(string patientGuid, string message)
        {
            var patient = _queueManager.GetPatientByGuid(patientGuid);
            var office = _queueManager.GetOfficeByPatient(patient);
            if (office != null && patient != null && patient.ConnectionIds != null && !string.IsNullOrEmpty(message)) {
                foreach (var connectionId in patient.ConnectionIds) {
                    await Clients.Client(connectionId).SendAsync("ReceiveMessage", office.Guid, message);
                }
            }
        }

        public async Task SetConnectionId(string guid)
        {
            _queueManager.SetConnectionId(guid, Context.ConnectionId);
            await Task.CompletedTask;
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            _queueManager.Disconnect(connectionId: Context.ConnectionId);
            await Task.CompletedTask;
        }

        public async Task CreatePatient(string guid, string name)
        {
            Office? office = _queueManager.GetOfficeByGuid(guid);
            if (office != null) {
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

        public async Task LetSomeoneGoAhead(string guid) 
        {
            _queueManager.LetSomeoneGoAhead(guid);
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