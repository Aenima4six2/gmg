using System.Text;

namespace Gmg.Emulator.Responses
{
    public abstract class ResponseBase : IResponse
    {
        public byte[] Body { get; protected set; }

        public override string ToString() => Encoding.ASCII.GetString(Body);
    }
}