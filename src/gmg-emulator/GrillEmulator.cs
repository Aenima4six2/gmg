using System;
using Gmg.Emulator.Enums;
using Gmg.Emulator.Requests;
using Gmg.Emulator.Responses;

namespace Gmg.Emulator
{
    public class GrillEmulator : IRequestProcessor
    {
        public string GrillId { get; } = "GMG10116294";
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
            probeSetTemp: TargetProbeTemp,
            grillState: IsOn ? GrillState.ON : GrillState.OFF
        );

        public IResponse HandleRequest(PowerOffRequest request)
        {
            IsOn = false;
            return new MessageResponse("OK");
        }

        public IResponse HandleRequest(PowerOnRequest request)
        {
            IsOn = true;
            return new MessageResponse("OK");
        }

        public IResponse HandleRequest(SetGrillTempRequest request)
        {
            TargetGrillTemp = request.DesiredTemperature;
            InterpolateTargetToCurrentGtillTemp();
            return new MessageResponse("OK");
        }

        public IResponse HandleRequest(SetProbeTempRequest request)
        {
            TargetProbeTemp = request.DesiredTemperature;
            InterpolateTargetToCurrentProbeTemp();
            return new MessageResponse("OK");
        }

        public IResponse HandleRequest(GrillIdRequest request) =>
            new MessageResponse(GrillId);

        public IResponse HandleRequest(GrillFirmwareRequest request) =>
            new MessageResponse(Guid.NewGuid().ToString());

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