using System.Threading.Tasks;

public interface IDialogueEngine {
    void init();
    Task<string> sendMessageAndGetAnswer(string message);
}
