using System.Text;

namespace Gmg.Emulator.Responses
{
    public class OkResponse : ResponseBase
    {
        public static OkResponse Default { get; } = new OkResponse();

        private OkResponse() => Body = Encoding.ASCII.GetBytes("OK");
    }
}