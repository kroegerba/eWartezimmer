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
        private readonly List<Office> _offices = new();
        private readonly string? _adminKey;
        internal string BaseUrl { get; set; }

        public QueueManager(IHubContext<EWartezimmerHub> hubContext, string baseUrl, string? adminKey)
        {
            _hubContext = hubContext;
            _timer = new Timer(
                      async _ => await UpdateTickAsync(),
                      null,
                      TimeSpan.Zero,
                      TimeSpan.FromMilliseconds(1000));
            BaseUrl = baseUrl;
            _adminKey = adminKey;
        }

        internal async Task UpdateTickAsync()
        {
            var finishedPatient = (Patient?) null;
            _offices.ForEach(office =>
            {
                office.Queue.ForEach(patient =>
                {
                    patient.WaitingTime = patient.WaitingTime > 0 ? patient.WaitingTime - 1 : 0;
                    patient.TreatmentTimeElapsed = patient.WaitingTime == 0 && patient.TreatmentTimeElapsed <= patient.TreatmentDuration ?
                        patient.TreatmentTimeElapsed + 1 :
                        0;
                    if (patient.TreatmentTimeElapsed == patient.TreatmentDuration) {
                        finishedPatient = patient;
                    }
                    if (patient.ConnectionIds != null) {
                        foreach (var connectionId in patient.ConnectionIds) {
                            _hubContext.Clients.Client(connectionId).SendAsync("Patient", JsonPatient(connectionId, office.Guid, patient.Guid));
                        }
                    }
                });

                if (finishedPatient != null) {
                    RemoveQueuer(office, finishedPatient);
                }
                if (office.ConnectionId != null) {
                    _hubContext.Clients.Client(office.ConnectionId).SendAsync("AllQueuers", JsonListAllQueuers(office.Guid));
                }
            });
            
            await _hubContext.Clients.All.SendAsync("AllOffices", JsonListAllOffices());
        }

        private string JsonPatient(string connectionId, string officeGuid, string patientGuid)
        {
            var patient = _offices.SingleOrDefault(o => officeGuid.Equals(o.Guid))?
                            .Queue.SingleOrDefault(p => patientGuid.Equals(p.Guid));
            return JsonSerializer.Serialize(patient);
        }

        private string JsonListAllOffices()
            => JsonSerializer.Serialize(_offices);

        internal bool IsAdminKey(string? candidate)
            => candidate != null && candidate.Equals(_adminKey);

        internal Patient? GetPatientByGuid(string? guid)
            => guid != null ? _offices.SelectMany(o => o.Queue).SingleOrDefault(patient => patient.Guid.Equals(guid)) : null;

        internal Patient? GetPatientByConnectionId(string connectionId) 
            => _offices.SelectMany(o => o.Queue).SingleOrDefault(patient => patient.ConnectionIds.Contains(connectionId));

        internal Office? GetOfficeByGuid(string? guid)
            => guid != null ? _offices.SingleOrDefault(office => office.Guid.Equals(guid)) : null;
        
        internal Office? GetOfficeByPatient(Patient? patient) 
            => patient != null ? _offices.SingleOrDefault(office => office.Queue.Contains(patient)) : null;

        internal string JsonListAllQueuers(string? guid)
            => JsonSerializer.Serialize(_offices.SingleOrDefault(office => office.Guid.Equals(guid))?.Queue ?? []);

        private int TakeTurnInLineNumber(Office office)
        {
            Patient? patientWithHighestTurnInLine = office.Queue.OrderByDescending(p => p.TurnInLine).FirstOrDefault();
            return patientWithHighestTurnInLine != null ? patientWithHighestTurnInLine.TurnInLine + 1 : 0;
        }

        internal void RemoveQueuer(Office office, Patient queuer)
        {
            var candidate = office.Queue.SingleOrDefault(patient => patient.Guid.Equals(queuer.Guid));
            if (candidate != null)
            {
                office.Queue.Remove(candidate);
                foreach (var patient in office.Queue) {
                    if (patient.TurnInLine > candidate.TurnInLine) {
                        patient.TurnInLine--;
                        patient.WaitingTime -= candidate.TreatmentDuration - candidate.TreatmentTimeElapsed;
                    }
                }
            }
        }

        internal Patient CreatePatient(Office office, string name)
        {
            Patient? patientWithHighestTurnInLine = office.Queue.OrderByDescending(p => p.TurnInLine).FirstOrDefault();
            var longestWait =
                (patientWithHighestTurnInLine != null) ?
                patientWithHighestTurnInLine.WaitingTime + patientWithHighestTurnInLine.TreatmentDuration - patientWithHighestTurnInLine.TreatmentTimeElapsed :
                0;

            var guid = Guid.NewGuid().ToString();

            var patient = new Patient(guid: guid)
            {
                Name = name,
                Latitude = office.Latitude,
                Longitude = office.Longitude,
                TurnInLine = TakeTurnInLineNumber(office),
                WaitingTime = office.Queue.Count switch
                {
                    0 => 0,
                    1 => office.Queue.Single().TreatmentDuration - office.Queue.Single().TreatmentTimeElapsed,
                    _ when office.Queue.Count >= 2 => longestWait,
                    _ => 0
                }
            };

            office.Queue.Add(patient);
            return patient;
        }

        internal void ChangePatientName(string guid, string newName)
        {
            var patient = _offices.SelectMany(o => o.Queue).SingleOrDefault(p => p.Guid.Equals(guid));
            if (patient != null) {
                patient.Name = newName;
            }
        }

        internal void ChangeTreatmentDuration(string guid, string newTreatmentDuration)
        {
            var patient = _offices.SelectMany(o => o.Queue).SingleOrDefault(p => p.Guid.Equals(guid));
            if (patient != null && int.TryParse(newTreatmentDuration, out var durationInMinutes)) {
                var office = _offices.SingleOrDefault(o => o.Queue.Contains(patient));
                if (office != null) {
                    foreach (var queuer in office.Queue.Where(p => p.TurnInLine > patient.TurnInLine)) {
                        queuer.WaitingTime = queuer.WaitingTime - patient.TreatmentDuration + patient.TreatmentTimeElapsed + durationInMinutes * 60;
                    }
                    patient.TreatmentDuration = durationInMinutes * 60;
                    patient.TreatmentTimeElapsed = 0;
                }
            }
        }

        internal void LetSomeoneGoAhead(string guid)
        {
            var patient = _offices.SelectMany(o => o.Queue).SingleOrDefault(p => p.Guid.Equals(guid));
            if (patient != null) {
                var office = _offices.SingleOrDefault(o => o.Queue.Contains(patient));
                if (office != null) {
                    var queuer = office.Queue.SingleOrDefault(p => p.TurnInLine - 1 == patient.TurnInLine);
                    if (queuer != null) {
                        (patient.TurnInLine, queuer.TurnInLine) = (queuer.TurnInLine, patient.TurnInLine);
                        queuer.WaitingTime = patient.WaitingTime;
                        patient.WaitingTime += queuer.TreatmentDuration;
                    }
                }
            }
        }

        internal Office CreateOffice(string name)
        {
            var guid = Guid.NewGuid().ToString();
            var office = new Office(guid)
            {
                Link = BaseUrl + "/Home/Office/" + guid,
                Name = name,
            };
            _offices.Add(office);
            return office;
        }

        internal void ChangeOfficeName(string guid, string newName)
        {
            var office = _offices.SingleOrDefault(p => p.Guid.Equals(guid));
            if (office != null) {
                office.Name = newName;
            }
        }

        internal void ChangeOfficeLocation(string guid, string newAddress, string newLatitude, string newLongitude)
        {
            var office = _offices.SingleOrDefault(p => p.Guid.Equals(guid));
            if (office != null) {
                office.Address = newAddress;
                office.Latitude = newLatitude;
                office.Longitude = newLongitude;
            }
        }

        internal void Disconnect(string connectionId)
        {
            var office = _offices.SingleOrDefault(o => o.ConnectionId != null && o.ConnectionId.Equals(connectionId));
            if (office != null) {
                office.ConnectionId = null;
            }

            var patient = _offices.SelectMany(o => o.Queue).SingleOrDefault(p => p.ConnectionIds.Contains(connectionId));            
            if (patient != null) {
                patient.ConnectionIds.Remove(connectionId);
            }
        }

        internal void SetConnectionId(string guid, string connectionId)
        {
            var office = _offices.SingleOrDefault(o => guid.Equals(o.Guid));
            if (office != null)
                office.ConnectionId = connectionId;
            var patient = _offices.SelectMany(o => o.Queue).SingleOrDefault(p => guid.Equals(p.Guid));
            if (patient != null) {
                if (!patient.ConnectionIds.Contains(connectionId)) {
                    patient.ConnectionIds.Add(connectionId);
                }
            }
        }
    }
}
