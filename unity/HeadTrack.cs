using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public enum VectorDirection{
    forward,
    up,
}

public class HeadTrack : MonoBehaviour
{
    public Transform playerTransform;
    public Transform headComponent;
    public float maxAngle = 60f;
    public float maxDistance = 20f;
    public float timeToLook = 0.5f;
    public VectorDirection headForwardVector = VectorDirection.forward;

    float interpolation = 0f;
    Vector3 initialHeadDirection;


    void FixedUpdate()
    {
        // check distance and angle to player
        Vector3 direction = playerTransform.position - headComponent.position;
        float distance = direction.magnitude;
        float angle = Vector3.Angle(direction, initialHeadDirection);

        // if player is close enough and at a good angle start interpolation
        if (distance < maxDistance && angle < maxAngle)
        {
            interpolation = Mathf.Min(interpolation + Time.fixedDeltaTime / timeToLook, 1f);
        }
        else
        {
            interpolation = Mathf.Max(interpolation - Time.fixedDeltaTime / timeToLook, 0f);
        }
    }
    

    void LateUpdate()
    {
        // rotate head toward player
        Vector3 direction = playerTransform.position + Vector3.up * 0.65f - headComponent.position;

        Vector3 headDirection;
        if (headForwardVector == VectorDirection.forward)
        {
            headDirection = headComponent.forward;
        }
        else
        {
            headDirection = headComponent.up;
        }

        // rotation from head up vector to player direction
        Quaternion rotation = Quaternion.FromToRotation(headDirection, direction);

        // apply rotation to head
        headComponent.rotation = Quaternion.Lerp(headComponent.rotation, rotation * headComponent.rotation, interpolation);
    }

    void Awake() {
        // save base head 
        if (headForwardVector == VectorDirection.forward)
        {
            initialHeadDirection = headComponent.forward;
        }
        else
        {
            initialHeadDirection = headComponent.up;
        }
    }
}
