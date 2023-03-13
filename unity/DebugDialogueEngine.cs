using UnityEngine;
using System.Threading.Tasks;

public class DebugDialogueEngine: IDialogueEngine {

    public DebugDialogueEngine() {

    }

    public void init() {
        Debug.Log("DebugDialogueEngine initialized");
    }

    public async Task<string> sendMessageAndGetAnswer(string message) {
        return await Task.FromResult<string>("That's a nice message!");
    }
}
