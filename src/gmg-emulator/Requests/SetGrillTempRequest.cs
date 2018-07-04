using Gmg.Emulator.Responses;

namespace Gmg.Emulator.Requests
{
    public class SetGrillTempRequest : RequestBase
    {
        public SetGrillTempRequest(string code, ushort temp) : base(code)
        {
            DesiredTemperature = temp;
        }

        public ushort DesiredTemperature { get; }

        public override IResponse Apply(IRequestProcessor processor) => processor.HandleRequest(this);
    }
}