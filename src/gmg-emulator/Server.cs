using System.Net;
using System.Net.Sockets;
using System.Threading;
using Gmg.Emulator.Helpers;
using Gmg.Emulator.Requests;
using Serilog;

namespace Gmg.Emulator
{
    public class Server
    {
        private readonly ServerOptions options;
        private readonly GrillEmulator emulator;

        public Server(ServerOptions options)
        {
            this.options = options;
            emulator = new GrillEmulator();
        }

        public void Listen(CancellationToken token = default(CancellationToken))
        {
            var address = string.IsNullOrWhiteSpace(options.Address)
                ? IPAddress.Any
                : IPAddress.Parse(options.Address);

            var endpoint = new IPEndPoint(address, options.Port);
            var client = new UdpClient(endpoint);
            var sender = new IPEndPoint(IPAddress.Any, 0);

            while (!token.IsCancellationRequested)
            {
                var requestBytes = client.Receive(ref sender);
                var request = RequestFactory.CreateFromBytes(requestBytes);
                Log.Logger.Information("Receiced Request: {name} ({type})",
                    request.GetType().Name.ToWords(), request.ToString());

                var response = emulator.HandleRequest(request);
                var responseBytes = response.Body;

                client.Send(responseBytes, responseBytes.Length, sender);
                Log.Logger.Information("Sent Response: {name} ({data})",
                    response.GetType().Name.ToWords(), response.ToString());
            }
        }
    }
}