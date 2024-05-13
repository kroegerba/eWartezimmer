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
        private readonly List<Patient> _queue = new();
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
            _queue.ForEach(patient =>
            {
                patient.WaitingTime = patient.WaitingTime > 0 ? patient.WaitingTime - 1 : 0;
                patient.TreatmentTimeElapsed = patient.WaitingTime == 0 && patient.TreatmentTimeElapsed <= patient.TreatmentDuration ?
                    patient.TreatmentTimeElapsed + 1 :
                    0;
                if (patient.TreatmentTimeElapsed == patient.TreatmentDuration) {
                    finishedPatient = patient;
                }
            });
            if (finishedPatient != null) {
                RemoveQueuer(finishedPatient);
            }
            
            await _hubContext.Clients.All.SendAsync("AllQueuers", JsonListAllQueuers());
            await _hubContext.Clients.All.SendAsync("AllOffices", JsonListAllOffices());
        }

        private string JsonListAllOffices()
            => JsonSerializer.Serialize(_offices);

        internal bool IsAdminKey(string? candidate)
            => candidate != null && candidate.Equals(_adminKey);

        internal Patient? GetPatientByGuid(string? guid)
            => guid != null ? _queue.SingleOrDefault(patient => patient.Guid.Equals(guid)) : null;

        internal string JsonListAllQueuers()
            => JsonSerializer.Serialize(_queue);

        private int TakeTurnInLineNumber()
        {
            Patient? patientWithHighestTurnInLine = _queue.OrderByDescending(p => p.TurnInLine).FirstOrDefault();
            return patientWithHighestTurnInLine != null ? patientWithHighestTurnInLine.TurnInLine + 1 : 0;
        }

        internal void RemoveQueuer(Patient queuer)
        {
            var candidate = _queue.SingleOrDefault(patient => patient.Guid.Equals(queuer.Guid));
            if (candidate != null)
            {
                _queue.Remove(candidate);
                // Decrease the turn in line for each patient after the departed patient
                foreach (var patient in _queue)
                {
                    if (patient.TurnInLine > candidate.TurnInLine)
                    {
                        patient.TurnInLine--;
                        patient.WaitingTime -= candidate.TreatmentDuration - candidate.TreatmentTimeElapsed;
                    }
                }
            }
        }

        internal Patient CreatePatient(string name)
        {
            Patient? patientWithHighestTurnInLine = _queue.OrderByDescending(p => p.TurnInLine).FirstOrDefault();
            var longestWait =
                (patientWithHighestTurnInLine != null) ?
                patientWithHighestTurnInLine.WaitingTime + patientWithHighestTurnInLine.TreatmentDuration - patientWithHighestTurnInLine.TreatmentTimeElapsed :
                0;

            var guid = Guid.NewGuid().ToString();

            var patient = new Patient(guid: guid)
            {
                Name = name,
                TurnInLine = TakeTurnInLineNumber(),
                WaitingTime = _queue.Count switch
                {
                    0 => 0,
                    1 => _queue.Single().TreatmentDuration - _queue.Single().TreatmentTimeElapsed,
                    _ when _queue.Count >= 2 => longestWait,
                    _ => 0
                }
            };

            _queue.Add(patient);
            return patient;
        }

        internal void ChangePatientName(string guid, string newName)
        {
            var patient = _queue.SingleOrDefault(p => p.Guid.Equals(guid));
            if (patient != null) {
                patient.Name = newName;
            }
        }

        internal Office CreateOffice(string name)
        {
            var guid = Guid.NewGuid().ToString();
            var office = new Office(guid)
            {
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

        internal void ChangeOfficeLocation(string guid, string newLatitude, string newLongitude)
        {
            var office = _offices.SingleOrDefault(p => p.Guid.Equals(guid));
            if (office != null) {
                office.Latitude = newLatitude;
                office.Longitude = newLongitude;
            }
        }
    }
}
