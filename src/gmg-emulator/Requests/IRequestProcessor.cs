using Gmg.Emulator.Responses;

namespace Gmg.Emulator.Requests
{
    public interface IRequestProcessor
    {
        IResponse HandleRequest(GrillInfoRequest request);
        IResponse HandleRequest(PowerOffRequest request);
        IResponse HandleRequest(PowerOnRequest request);
        IResponse HandleRequest(SetGrillTempRequest request);
        IResponse HandleRequest(SetProbeTempRequest request);
        IResponse HandleRequest(GrillIdRequest request);
        IResponse HandleRequest(GrillFirmwareRequest request);
    }
}