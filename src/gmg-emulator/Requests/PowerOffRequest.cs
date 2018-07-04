using Gmg.Emulator.Responses;

namespace Gmg.Emulator.Requests
{
    public class PowerOffRequest : RequestBase
    {
        public PowerOffRequest(string code) : base(code)
        {
        }

        public override IResponse Apply(IRequestProcessor processor) => processor.HandleRequest(this);
    }
}