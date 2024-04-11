using Microsoft.AspNetCore.SignalR;

namespace eWartezimmer.Hubs
{
    public class ChatHub : Hub
    {
        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }

        public async Task SendMessageToConnectionId(string connectionId, string message)
        {
            await Clients.Client(connectionId).SendAsync("ReceiveMessage", connectionId, message);
        }

        
    }
}