using UnityEngine;
using TMPro;


public class EnterAPIKey : MonoBehaviour
{
    public TMP_InputField inputField;

    void Awake() {
        // player controller starts off
        var player = GameObject.Find("Player");
        player.GetComponent<FirstPersonController>().enabled = false;
    }
    
    public void OnEnterOk()
    {
        string key = inputField.text;

        GPTDialogue.StartApi(key);
        // activate player controller
        var player = GameObject.Find("Player");
        player.GetComponent<FirstPersonController>().enabled = true;

        // destroy the text box and this component
        Destroy(inputField.gameObject);
        Destroy(this.gameObject);
    }
}
