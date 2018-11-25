using System;
using System.Threading.Tasks;
using Gmg.Emulator.Enums;
using Gmg.Emulator.Requests;
using Gmg.Emulator.Responses;

namespace Gmg.Emulator
{
    public class GrillEmulator : IRequestProcessor
    {
        private const ushort MAX_GRILL_TEMP = 500;
        private const ushort MIN_GRILL_TEMP = 90;
        private const ushort MIN_PROBE_TEMP = 80;
        private const int MAX_ITERATIONS = 300;

        private double iterations;
        private int onCounter;

        public string GrillId { get; } = "GMG10116294";
        public bool IsOn { get; private set; }

        public ushort TargetGrillTemp { get; private set; }
        public ushort TargetProbeTemp { get; private set; }

        public ushort CurrentGrillTemp { get; private set; } = MIN_GRILL_TEMP;
        public ushort CurrentProbeTemp { get; private set; } = MIN_PROBE_TEMP;

        public GrillEmulator()
        {
            iterations = MAX_ITERATIONS;
            StartInterpolationLoop();
        }

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
            grillState: IsOn ? GrillState.ON : GrillState.OFF,
            warnCode: onCounter > 0 && onCounter % 3 == 0 ? WarnCode.LOW_PELLET : WarnCode.NONE
        );

        public IResponse HandleRequest(PowerOffRequest request)
        {
            IsOn = false;
            TargetGrillTemp = 0;
            TargetProbeTemp = 0;
            InterpolateTemperatures();
            return new MessageResponse("OK");
        }

        public IResponse HandleRequest(PowerOnRequest request)
        {
            if (!IsOn) onCounter++;
            IsOn = true;
            return new MessageResponse("OK");
        }

        public IResponse HandleRequest(SetGrillTempRequest request)
        {
            TargetGrillTemp = request.DesiredTemperature;
            InterpolateTemperatures();
            return new MessageResponse("OK");
        }

        public IResponse HandleRequest(SetProbeTempRequest request)
        {
            TargetProbeTemp = request.DesiredTemperature;
            return new MessageResponse("OK");
        }

        public IResponse HandleRequest(GrillIdRequest request) =>
            new MessageResponse(GrillId);

        public IResponse HandleRequest(GrillFirmwareRequest request) =>
            new MessageResponse(Guid.NewGuid().ToString());

        private void InterpolateTemperatures()
        {
            iterations = 0;
        }

        private ushort ConstrainGrillTemp(ushort temp) => Math.Min(Math.Max(temp, MIN_GRILL_TEMP), MAX_GRILL_TEMP);

        private ushort ConstrainPropeTemp(ushort temp) => Math.Min(Math.Max(temp, MIN_PROBE_TEMP), MAX_GRILL_TEMP);

        private void StartInterpolationLoop()
        {
            Task.Run(async () =>
            {
                while (true)
                {
                    await Task.Delay(TimeSpan.FromSeconds(1));

                    if (iterations < MAX_ITERATIONS)
                    {
                        iterations++;
                        CurrentGrillTemp = ConstrainGrillTemp((ushort)Math.Min(CurrentGrillTemp + 2, TargetGrillTemp));
                        CurrentProbeTemp = ConstrainPropeTemp((ushort)Math.Min(CurrentProbeTemp + 1, TargetGrillTemp));
                    }
                    else
                    {
                        CurrentGrillTemp = ConstrainGrillTemp(TargetGrillTemp);
                        CurrentProbeTemp = ConstrainPropeTemp(TargetGrillTemp);
                    }
                }
            });
        }
    }
}