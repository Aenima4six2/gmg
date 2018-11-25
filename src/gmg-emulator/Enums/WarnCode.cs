namespace Gmg.Emulator.Enums
{
    public enum WarnCode
    {
        NONE = 0,
        FAN_OVERLOADED = 16,
        AUGER_OVERLOADED = 32,
        IGNITOR_OVERLOADED = 48,
        BATTERY_LOW = 64,
        FAN_DISCONNECTED = 80,
        AUGER_DISCONNECTED = 96,
        IGNITOR_DISCONNECTED = 112,
        LOW_PELLET = 128
    }
}