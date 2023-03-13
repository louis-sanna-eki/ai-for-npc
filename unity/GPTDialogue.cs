using OpenAI_API;
using System.Threading.Tasks;
using UnityEngine;
// GPT API Dialogue Engine

public class GPTDialogue: IDialogueEngine {
    static OpenAIAPI api;

    OpenAI_API.Chat.Conversation chat;
    string promptSystem;
    string promptUser;
    string promptExample;

    public static void StartApi(string key) {
        api = new OpenAIAPI(key);
    }

    public GPTDialogue(string promptSystem, string promptUser, string promptExample) {
        this.promptSystem = promptSystem;
        this.promptUser = promptUser;
        this.promptExample = promptExample;
    }

    public void init()
    {
        chat = api.Chat.CreateConversation();
        chat.AppendSystemMessage(this.promptSystem);
        if (this.promptUser != null && this.promptUser != "") {
            chat.AppendUserInput(this.promptUser);
        }
        if (this.promptExample != null && this.promptExample != "") {
            chat.AppendExampleChatbotOutput(this.promptExample);
        }
    }

    public Task<string> sendMessageAndGetAnswer(string message)
    {
        if (chat == null) {
            Debug.Log("First call, init");
            init();
        }

        chat.AppendUserInput(message);
        Debug.Log("Message sent");
        return chat.GetResponseFromChatbot();
    }
}
