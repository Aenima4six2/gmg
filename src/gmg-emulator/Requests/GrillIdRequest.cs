using Gmg.Emulator.Responses;

namespace Gmg.Emulator.Requests
{
    public class GrillIdRequest : RequestBase
    {
        public GrillIdRequest(string code) : base(code)
        {
        }

        public override IResponse Apply(IRequestProcessor processor) => processor.HandleRequest(this);
    }
}