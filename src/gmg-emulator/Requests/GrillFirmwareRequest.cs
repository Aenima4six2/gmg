using Gmg.Emulator.Responses;

namespace Gmg.Emulator.Requests
{
    public class GrillFirmwareRequest : RequestBase
    {
        public GrillFirmwareRequest(string code) : base(code)
        {
        }

        public override IResponse Apply(IRequestProcessor processor) => processor.HandleRequest(this);
    }
}