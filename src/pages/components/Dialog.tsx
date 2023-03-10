import { Character } from "@prisma/client";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { buildPrompt, Template } from "~/prompts";
import { ChatGPTMessage } from "~/utils/OpenAIStream";
import Button from "./Button";

const actionRegex = /\[(.*?)\]/g;

export default function Dialog({ character }: { character?: Character }) {
  const prompt = character
    ? buildPrompt(character?.data as unknown as Template)
    : "placeholder prompt";
  const [isLoading, setIsLoading] = useState(false);
  const [dialog, setDialog] = useState<string>("");
  const [messages, setMessages] = useState<ChatGPTMessage[]>([
    { role: "system", content: `You are ${character?.name ?? "Anonymous"}. Your occupation is ${(character?.data as unknown as Template)?.character?.occupation ?? "unknown"}` },
    { role: "user", content: prompt },
  ]);
  const liveMessages = useMemo(() => {
    if (dialog === "") return messages;
    if (!isLoading) return messages;
    return [
      ...messages,
      { role: "assistant", content: dialog } as ChatGPTMessage,
    ];
  }, [messages, dialog]);

  useEffect(() => {
    if (isLoading) return;
    if (dialog === "") return;
    const [lastMessage] = messages.slice(-1);
    if (lastMessage?.role === "assistant") return;
    setMessages((prev) => {
      return [
        ...prev,
        { role: "assistant", content: dialog } as ChatGPTMessage,
      ];
    });
  }, [dialog, isLoading]);

  const lastAction = findAction(dialog);
  const isReadyForGeneration = !isLoading && lastAction === "[NOTHING]";

  return (
    <div className="flex w-full flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold text-white">{`Speak with ${character?.name}!`}</h2>
      <div className="my-2 flex w-full flex-col items-center justify-center space-y-10">
        <Messages messages={liveMessages} character={character} />
        <AddMessage
          disabled={!isReadyForGeneration}
          onAdd={(message) => {
            if (message?.content.trim() === "") return;
            const newMessages = [...messages, message];
            setMessages(newMessages);
            generateDialog(newMessages);
          }}
        />
      </div>
    </div>
  );

  async function generateDialog(currentMessages: ChatGPTMessage[]) {
    console.log("currentMessages", currentMessages);
    setDialog("");
    setIsLoading(true);
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: currentMessages }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setDialog((prev) => prev + chunkValue);
    }
    setIsLoading(false);
  }
}

function AddMessage({
  onAdd,
  disabled = false,
}: {
  onAdd: (msg: ChatGPTMessage) => void;
  disabled?: boolean;
}) {
  const [content, setContent] = useState("");
  const addMessage = () => {
    onAdd({ role: "user", content });
    setContent("");
  };
  return (
    <div className="flex h-12 gap-2">
      <input
        className="w-96 rounded-md border-2 border-zinc-800 px-4 py-2 text-black focus:outline-none"
        placeholder="Have your say..."
        minLength={10}
        maxLength={400}
        value={content}
        onChange={(event) => setContent(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            addMessage();
          }
        }}
      />
      <Button disabled={disabled} onClick={addMessage}>
        Add
      </Button>
    </div>
  );
}

function Messages({
  messages,
  character,
}: {
  messages: ChatGPTMessage[];
  character?: Character;
}) {
  return (
    <div>
      {messages.slice(2).map(({ content, role }, index) => {
        const action = findAction(content);
        return (
          <>
            <TextBox
              key={index}
              className={
                role === "assistant"
                  ? "bg-purple-500 text-white hover:bg-purple-400"
                  : "bg-white text-black hover:bg-gray-100"
              }
            >
              {(content.split("[")[0] ?? "").replace(
                `${character?.name}: `,
                ""
              )}
            </TextBox>
            {action !== "[NOTHING]" ? (
              <TextBox
                key={index + "action"}
                className={"bg-red-500 text-white"}
              >{`Action ${action.toUpperCase()} initiated!`}</TextBox>
            ) : null}
          </>
        );
      })}
    </div>
  );
}

function findAction(content: string) {
  const [action] = content.match(actionRegex) ?? ["[NOTHING]"];
  return action;
}

function TextBox({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="mx-auto mt-4 flex max-w-xl flex-col items-center justify-center space-y-8">
      <div
        className={`rounded-xl border  p-4 shadow-md transition  ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
