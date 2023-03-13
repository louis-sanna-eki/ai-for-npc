using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public struct UiRefreshData
{
    public string answer;
    public TMP_Text answerTextComponent;
}

public class NPCDialogue : MonoBehaviour
{
    // dialogue box prefab
    public GameObject dialogueBoxPrefab;
    
    // dialogue bubble prefab
    public GameObject dialogueBubblePrefab;

    public string npcId;
    

    string answer = "";
    TMP_Text answerTextComponent;

    IDialogueEngine dialogueEngine;

    GameObject dialogueBox;
    Transform dialogueScrollContent;
    ScrollRect dialogueScrollRect;
    TMP_InputField userMesssageInputField;

    IEnumerator ApplyScrollPosition( ScrollRect sr, float verticalPos )
    {
        yield return new WaitForEndOfFrame( );
        sr.verticalNormalizedPosition = verticalPos;
        LayoutRebuilder.ForceRebuildLayoutImmediate( (RectTransform)sr.transform );
    }

    public void Update()
    {
        if (Input.GetKeyDown(KeyCode.Return) && userMesssageInputField.text != "")
        {
            OnUserMessage(userMesssageInputField.text);
            userMesssageInputField.text = "";
        }

        if (answer != "") {
            // write text in answer box
            answerTextComponent.text = answer;
            userMesssageInputField.interactable = true;


            // now scroll to bottom
            StartCoroutine(ApplyScrollPosition(dialogueScrollRect, 0f));

            userMesssageInputField.Select();
            userMesssageInputField.ActivateInputField();

            answer = "";
        }

        // exit dialogue if control + Esc is pressed
        if (Input.GetKey(KeyCode.Escape))
        {
            ExitDialogue();
        }
    }
    
    public void OnUserMessage(string message)
    {
        // create dialogue box
        GameObject dialogue = Instantiate(dialogueBubblePrefab, dialogueScrollContent);
        // set text
        dialogue.GetComponentInChildren<TMP_Text>().text = message;

        // create answer box
        GameObject answerBox = Instantiate(dialogueBubblePrefab, dialogueScrollContent);
        answerTextComponent = answerBox.GetComponentInChildren<TMP_Text>();
       
        // make input field inactive while waiting for response
        userMesssageInputField.interactable = false;

        Debug.Log("sending message: " + message);
        // send new text from dialogue engine and get response
        dialogueEngine.sendMessageAndGetAnswer(message).ContinueWith((task) =>
        {
            Debug.Log("got response: " + task.Result);
            answer = task.Result;
        });

        StartCoroutine(ApplyScrollPosition(dialogueScrollRect, 0f));
    }

    void Awake()
    {
        Debug.Log("awake");

        // get npc data
        Transform NPC_LIBRARY = GameObject.Find("NPC_LIBRARY").transform;
        NPCData npcData = NPC_LIBRARY.Find(npcId).GetComponent<NPCData>();

        dialogueEngine = new GPTDialogue(npcData.promptSystem, npcData.promptUser, npcData.promptExample);
        
        // instantiate dialogue box
        dialogueBox = Instantiate(dialogueBoxPrefab, GameObject.Find("Canvas").transform);

        // find dialogue box content transform
        var scrollView = dialogueBox.transform.Find("Scroll View");

        dialogueScrollContent = scrollView.Find("Viewport").Find("Content");
        dialogueScrollRect = scrollView.GetComponent<ScrollRect>();
        userMesssageInputField = dialogueBox.transform.GetComponentInChildren<TMP_InputField>();

        // check collision with player collider
        var playerCollider = GameObject.Find("Player").GetComponent<Collider>();
        var npcCollider = GetComponent<Collider>();
        // are they colliding?
        if (playerCollider.bounds.Intersects(npcCollider.bounds))
        {
            Debug.Log("colliding");
            // show dialogue box
            dialogueBox.SetActive(true);
        }
        else
        {
            Debug.Log("not colliding");
            // hide dialogue box
            dialogueBox.SetActive(false);
        }
    }

    void ExitDialogue()
    {
        dialogueBox.SetActive(false);

        // give back control to first person controller
        GameObject.Find("Player").GetComponent<FirstPersonController>().enabled = true;
    }

    void OnTriggerEnter(Collider other)
    {
        if (other.gameObject.name != "Player")
        {
            return;
        }
        Debug.Log("colliding");
        // show dialogue box
        dialogueBox.SetActive(true);

        // deactivate first person controller
        GameObject.Find("Player").GetComponent<FirstPersonController>().enabled = false;

        // focus on input field
        userMesssageInputField.Select();
        userMesssageInputField.ActivateInputField();
        
        // erase current text
        userMesssageInputField.text = "";
    }
}
