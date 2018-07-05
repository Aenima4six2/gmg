using Gmg.Emulator.Helpers;

namespace Gmg.Emulator.Responses
{
    public class MessageResponse : IResponse
    {
        public MessageResponse(string message)
        {
            Message = message;
        }

        public string Message { get; }


        public byte[] ToBytes() => Message.ToBytes();
        public override string ToString() => Message;
    }
}