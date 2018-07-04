using System.Text;
using Gmg.Emulator.Enums;
using Gmg.Emulator.Helpers;

namespace Gmg.Emulator.Responses
{
    public class GrillInfoResponse : ResponseBase
    {
        private const ushort PREFIX = 00;
        private const ushort GRILL_TEMP = 02;
        private const ushort GRILL_TEMP_HIGH = 03;
        private const ushort PROBE_TEMP = 04;
        private const ushort PROBE_TEMP_HIGH = 05;
        private const ushort GRILL_SET_TEMP = 06;
        private const ushort GRILL_SET_TEMP_HIGH = 07;
        private const ushort CURVE_REMAIN_TIME = 20;
        private const ushort WARN_CODE = 24;
        private const ushort PROBE_SET_TEMP = 28;
        private const ushort PROBE_SET_TEMP_HIGH = 29;
        private const ushort GRILL_STATE = 30;
        private const ushort GRILL_MODE = 31;
        private const ushort FIRE_STATE = 32;
        private const ushort FILE_STATE_PERCENT = 33;
        private const ushort PROFILE_END = 34;
        private const ushort GRILL_TYPE = 35;

        public GrillInfoResponse(
            ushort grillTemp = 0,
            ushort grillTempHigh = 0,
            ushort probeTemp = 0,
            ushort probeTempHigh = 0,
            ushort grillSetTemp = 0,
            ushort grillSetTempHigh = 0,
            ushort curveRemainTime = 0,
            WarnCode warnCode = WarnCode.FAN_OVERLOADED,
            ushort probeSetTemp = 0,
            ushort probeSetTempHigh = 0,
            GrillState grillState = GrillState.OFF,
            string grillMode = "NA",
            FireState fireState = FireState.DEFAULT,
            ushort fileStatePercent = 0,
            string profileEnd = "NA",
            string grillType = "NA"
        )
        {
            GrillTemp = grillTemp;
            GrillTempHigh = grillTempHigh;
            ProbeTemp = probeTemp;
            ProbeTempHigh = probeTempHigh;
            GrillSetTemp = grillSetTemp;
            GrillSetTempHigh = grillSetTempHigh;
            CurveRemainTime = curveRemainTime;
            WarnCode = warnCode;
            ProbeSetTemp = probeSetTemp;
            ProbeSetTempHigh = probeSetTempHigh;
            GrillState = grillState;
            GrillMode = grillMode;
            FireState = fireState;
            FileStatePercent = fileStatePercent;
            ProfileEnd = profileEnd;
            GrillType = grillType;
            Body = CreateBody();
        }

        public ushort GrillTemp { get; }
        public ushort GrillTempHigh { get; }
        public ushort ProbeTemp { get; }
        public ushort ProbeTempHigh { get; }
        public ushort GrillSetTemp { get; }
        public ushort GrillSetTempHigh { get; }
        public ushort CurveRemainTime { get; }
        public WarnCode WarnCode { get; }
        public ushort ProbeSetTemp { get; }
        public ushort ProbeSetTempHigh { get; }
        public GrillState GrillState { get; }
        public string GrillMode { get; }
        public FireState FireState { get; }
        public ushort FileStatePercent { get; }
        public string ProfileEnd { get; }
        public string GrillType { get; }

        private byte[] CreateBody()
        {
            var body = new byte[72];
            body.Set(PREFIX, "UR".ToBytes());
            body.Set(GRILL_TEMP, GrillTemp.ToBytes());
            body.Set(GRILL_TEMP_HIGH, GrillTempHigh.ToBytes());
            body.Set(PROBE_TEMP, ProbeTemp.ToBytes());
            body.Set(PROBE_TEMP_HIGH, ProbeTempHigh.ToBytes());
            body.Set(GRILL_SET_TEMP, GrillSetTemp.ToBytes());
            body.Set(GRILL_SET_TEMP_HIGH, GrillSetTempHigh.ToBytes());
            body.Set(CURVE_REMAIN_TIME, CurveRemainTime.ToBytes());
            body.Set(WARN_CODE, WarnCode.ToBytes());
            body.Set(PROBE_SET_TEMP, ProbeSetTemp.ToBytes());
            body.Set(PROBE_SET_TEMP_HIGH, ProbeSetTempHigh.ToBytes());
            body.Set(GRILL_STATE, GrillState.ToBytes());
            body.Set(GRILL_MODE, GrillMode.ToBytes());
            body.Set(FIRE_STATE, FireState.ToBytes());
            body.Set(FILE_STATE_PERCENT, FileStatePercent.ToBytes());
            body.Set(PROFILE_END, ProfileEnd.ToBytes());
            body.Set(GRILL_TYPE, GrillType.ToBytes());
            return body;
        }

        public override string ToString() => new StringBuilder()
            .AppendFormat("{0}: {1}, ", nameof(GrillTemp).ToWords(), GrillTemp)
            .AppendFormat("{0}: {1}, ", nameof(GrillTempHigh).ToWords(), GrillTempHigh)
            .AppendFormat("{0}: {1}, ", nameof(ProbeTemp).ToWords(), ProbeTemp)
            .AppendFormat("{0}: {1}, ", nameof(ProbeTempHigh).ToWords(), ProbeTempHigh)
            .AppendFormat("{0}: {1}, ", nameof(GrillSetTemp).ToWords(), GrillSetTemp)
            .AppendFormat("{0}: {1}, ", nameof(GrillSetTempHigh).ToWords(), GrillSetTempHigh)
            .AppendFormat("{0}: {1}, ", nameof(CurveRemainTime).ToWords(), CurveRemainTime)
            .AppendFormat("{0}: {1}, ", nameof(WarnCode).ToWords(), WarnCode)
            .AppendFormat("{0}: {1}, ", nameof(ProbeSetTemp).ToWords(), ProbeSetTemp)
            .AppendFormat("{0}: {1}, ", nameof(ProbeSetTempHigh).ToWords(), ProbeSetTempHigh)
            .AppendFormat("{0}: {1}, ", nameof(GrillState).ToWords(), GrillState)
            .AppendFormat("{0}: {1}, ", nameof(GrillMode).ToWords(), GrillMode)
            .AppendFormat("{0}: {1}, ", nameof(FireState).ToWords(), FireState)
            .AppendFormat("{0}: {1}, ", nameof(FileStatePercent).ToWords(), FileStatePercent)
            .AppendFormat("{0}: {1}, ", nameof(ProfileEnd).ToWords(), ProfileEnd)
            .AppendFormat("{0}: {1}", nameof(GrillType).ToWords(), GrillType)
            .ToString();
    }
}