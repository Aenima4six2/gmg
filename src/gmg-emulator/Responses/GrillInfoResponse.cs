using System;
using System.Text;
using Gmg.Emulator.Enums;
using Gmg.Emulator.Helpers;

namespace Gmg.Emulator.Responses
{
    public class GrillInfoResponse : ResponseBase
    {
        // UR [2 Byte Prefix]
        private const byte PREFIX = 00; // 2 Byte

        // [2 Byte Grill Temp]
        private const byte GRILL_TEMP = 02; // 1 Byte
        private const byte GRILL_TEMP_HIGH = 03; // 1 Byte

        // [2 Byte food probe Temp]
        private const byte PROBE_TEMP = 04; // 1 Byte
        private const byte PROBE_TEMP_HIGH = 05; // 1 Byte

        // [2 Byte Target Temp]
        private const byte GRILL_SET_TEMP = 06; // 1 Byte
        private const byte GRILL_SET_TEMP_HIGH = 07; // 1 Byte

        // [skip 22 bytes]
        private const byte CURVE_REMAIN_TIME = 20; // 4 Byte
        private const byte WARN_CODE = 24; // 4 Byte

        // [2 Byte target food probe]
        private const byte PROBE_SET_TEMP = 28; // 1 Byte
        private const byte PROBE_SET_TEMP_HIGH = 29; // 1 Byte

        // [1 Byte on/off/fan]
        private const byte GRILL_STATE = 30; // 1 Byte

        // [5 Byte tail]
        private const byte GRILL_MODE = 31; // 1 Byte
        private const byte FIRE_STATE = 32; // 1 Byte
        private const byte FILE_STATE_PERCENT = 33; // 1 Byte
        private const byte PROFILE_END = 34; // 1 Byte
        private const byte GRILL_TYPE = 35; // 1 Byte

        public GrillInfoResponse(
            ushort grillTemp = 0,
            ushort probeTemp = 0,
            ushort grillSetTemp = 0,
            ushort probeSetTemp = 0,
            GrillState grillState = GrillState.OFF
        )
        {
            GrillTemp = grillTemp;
            ProbeTemp = probeTemp;
            GrillSetTemp = grillSetTemp;
            ProbeSetTemp = probeSetTemp;
            GrillState = grillState;
            Body = CreateBody();
        }

        public ushort GrillTemp { get; }
        public ushort ProbeTemp { get; }
        public ushort GrillSetTemp { get; }
        public ushort ProbeSetTemp { get; }
        public GrillState GrillState { get; }

        private byte[] CreateBody()
        {
            var body = new byte[36];

            var grillTempHigh = (byte) (GrillTemp / 256);
            var grillTemp = (byte) (GrillTemp - grillTempHigh);

            var probeTempHigh = (byte) (ProbeTemp / 256);
            var probeTemp = (byte) (ProbeTemp - probeTempHigh);

            var grillSetTempHigh = (byte) (GrillSetTemp / 256);
            var grillSetTemp = (byte) (GrillSetTemp - grillSetTempHigh);

            var probeSetTempHigh = (byte) (ProbeSetTemp / 256);
            var probeSetTemp = (byte) (ProbeSetTemp - probeSetTempHigh);

            body.Set(PREFIX, "UR".ToBytes());
            body.Set(GRILL_TEMP, grillTemp);
            body.Set(GRILL_TEMP_HIGH, grillTempHigh);
            body.Set(PROBE_TEMP, probeTemp);
            body.Set(PROBE_TEMP_HIGH, probeTempHigh);
            body.Set(GRILL_SET_TEMP, grillSetTemp);
            body.Set(GRILL_SET_TEMP_HIGH, grillSetTempHigh);

            body.Fill(20, (byte) 0xFF, 4);

            body.Set(PROBE_SET_TEMP, probeSetTemp);
            body.Set(PROBE_SET_TEMP_HIGH, probeSetTempHigh);
            body.Set(GRILL_STATE, (byte) GrillState);
            return body;
        }

        public override string ToString() => new StringBuilder()
            .AppendFormat("{0}: {1}, ", nameof(GrillTemp).ToWords(), GrillTemp)
            .AppendFormat("{0}: {1}, ", nameof(ProbeTemp).ToWords(), ProbeTemp)
            .AppendFormat("{0}: {1}, ", nameof(GrillSetTemp).ToWords(), GrillSetTemp)
            .AppendFormat("{0}: {1}, ", nameof(ProbeSetTemp).ToWords(), ProbeSetTemp)
            .AppendFormat("{0}: {1}, ", nameof(GrillState).ToWords(), GrillState)
            .AppendFormat("{0}: {1}", nameof(Body).ToWords(), BitConverter.ToString(Body).Replace("-", string.Empty))
            .ToString();
    }
}