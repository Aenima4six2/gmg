using CommandLine;

namespace Gmg.Emulator
{
    public class ServerOptions
    {
        [Option(shortName: 'r', longName: "port", Default = 8080)]
        public int Port { get; set; }

        [Option(shortName: 'a', longName: "address", Default = "127.0.0.1")]
        public string Address { get; set; }
    }
}