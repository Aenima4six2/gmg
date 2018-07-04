using Gmg.Emulator.Enums;
using Gmg.Emulator.Requests;
using Gmg.Emulator.Responses;

namespace Gmg.Emulator
{
    public class GrillEmulator : IRequestProcessor
    {
        public bool IsOn { get; private set; }

        public ushort TargetGrillTemp { get; private set; }
        public ushort TargetProbeTemp { get; private set; }

        public ushort CurrentGrillTemp { get; private set; } = 90;
        public ushort CurrentProbeTemp { get; private set; } = 80;

        public IResponse HandleRequest(IRequest request)
        {
            var response = request.Apply(this);
            return response;
        }

        public IResponse HandleRequest(GrillInfoRequest request) => new GrillInfoResponse(
            grillTemp: CurrentGrillTemp,
            probeTemp: CurrentProbeTemp,
            grillSetTemp: TargetGrillTemp,
            probeSetTemp: CurrentProbeTemp,
            grillState: IsOn ? GrillState.ON : GrillState.OFF
        );

        public IResponse HandleRequest(PowerOffRequest request)
        {
            IsOn = false;
            return OkResponse.Default;
        }

        public IResponse HandleRequest(PowerOnRequest request)
        {
            IsOn = true;
            return OkResponse.Default;
        }

        public IResponse HandleRequest(SetGrillTempRequest request)
        {
            TargetGrillTemp = request.DesiredTemperature;
            InterpolateTargetToCurrentGtillTemp();
            return OkResponse.Default;
        }

        public IResponse HandleRequest(SetProbeTempRequest request)
        {
            TargetProbeTemp = request.DesiredTemperature;
            InterpolateTargetToCurrentProbeTemp();
            return OkResponse.Default;
        }

        private void InterpolateTargetToCurrentGtillTemp()
        {
            CurrentGrillTemp = TargetGrillTemp;
        }

        private void InterpolateTargetToCurrentProbeTemp()
        {
            CurrentProbeTemp = TargetProbeTemp;
        }
    }
}