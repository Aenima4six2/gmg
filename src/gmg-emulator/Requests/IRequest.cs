using Gmg.Emulator.Responses;

namespace Gmg.Emulator.Requests
{
    public interface IRequest
    {
        string Code { get; }
        
        IResponse Apply(IRequestProcessor processor);
    }
}