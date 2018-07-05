using System;
using CommandLine;
using Serilog;

namespace Gmg.Emulator
{
    internal static class Program
    {
        private static void Main(string[] args)
        {
            ConfigureLogger();
            Parser.Default.ParseArguments<ServerOptions>(args)
                .WithParsed(opts =>
                {
                    Log.Logger.Information("Starting Grill emulation server");
                    var server = new Server(opts);
                    server.Listen();
                })
                .WithNotParsed(errs =>
                {
                    foreach (var error in errs)
                    {
                        Log.Logger.Error("Error parsing command line args {error}", error);
                    }

                    Environment.Exit(1);
                });
        }

        private static void ConfigureLogger()
        {
            Log.Logger = new LoggerConfiguration().WriteTo.Console().CreateLogger();
        }
    }
}