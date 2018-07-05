using CommandLine;

namespace Gmg.Emulator
{
    public class ServerOptions
    {
        [Option(shortName: 'p', longName: "port", Default = 8080)]
        public int Port { get; set; }

        [Option(shortName: 'a', longName: "address", Default = "*")]
        public string Address { get; set; }
    }
}