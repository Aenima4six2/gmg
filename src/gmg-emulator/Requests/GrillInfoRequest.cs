using Gmg.Emulator.Responses;

namespace Gmg.Emulator.Requests
{
    public class GrillInfoRequest : RequestBase
    {
        public GrillInfoRequest(string code) : base(code)
        {
        }
        
        public override IResponse Apply(IRequestProcessor processor) => processor.HandleRequest(this);
    }
}