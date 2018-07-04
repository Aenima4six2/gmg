using Gmg.Emulator.Responses;

namespace Gmg.Emulator.Requests
{
    public class PowerOnRequest : RequestBase
    {
        public PowerOnRequest(string code) : base(code)
        {
        }

        public override IResponse Apply(IRequestProcessor processor) => processor.HandleRequest(this);
    }
}