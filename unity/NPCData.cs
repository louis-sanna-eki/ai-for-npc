using System.Collections;
using System.Collections.Generic;
using UnityEngine;


public class NPCData: MonoBehaviour
{
    [Header("NPC Prompts")]
    [TextArea(3, 1000)]
    public string promptSystem;
    [TextArea(3, 1000)]
    public string promptUser;
    [TextArea(3, 1000)]
    public string promptExample;
}
