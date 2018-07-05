using System;
using System.Net;
using System.Net.Sockets;
using System.Text;
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
            var address = string.IsNullOrWhiteSpace(options.Address) ||
                          string.Equals("*", options.Address, StringComparison.OrdinalIgnoreCase)
                ? IPAddress.Any
                : IPAddress.Parse(options.Address);

            var endpoint = new IPEndPoint(address, options.Port);
            var client = new UdpClient(endpoint);
            var sender = new IPEndPoint(IPAddress.Any, 0);

            Log.Logger.Information("Now listening for traffic on at {address}:{port}",
                address, options.Port);

            while (!token.IsCancellationRequested)
            {
                var requestBytes = client.Receive(ref sender);
                var requestTxt = Encoding.ASCII.GetString(requestBytes);
                Log.Logger.Information("Recieved Request: [{ip}] -> {requestTxt}", sender, requestTxt);

                var request = RequestFactory.CreateFromBytes(requestBytes);
                if (request == null)
                {
                    Log.Logger.Warning("Invalid Request: [{ip}] -> [{requestTxt}] not supported!", sender, requestTxt);
                    continue;
                }

                Log.Logger.Information("Parsed Request: [{ip}] -> {name} ({type})",
                    sender, request.GetType().Name.ToWords(), request.ToString());

                var response = emulator.HandleRequest(request);
                var responseBytes = response.ToBytes();

                client.Send(responseBytes, responseBytes.Length, sender);
                Log.Logger.Information("Sent Response: [{ip}] -> {name} ({data})",
                    sender, response.GetType().Name.ToWords(), response.ToString());
            }
        }
    }
}