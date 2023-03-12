import { Character } from "@prisma/client";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { buildPrompt, Template } from "~/prompts";
import { ChatGPTMessage } from "~/utils/OpenAIStream";
import Button from "./Button";
import LexicaImage from "./LexicaImage";

export default function Dialog({ character }: { character?: Character }) {
  const prompt = character
    ? buildPrompt(character?.data as unknown as Template)
    : "placeholder prompt";
  const [isLoading, setIsLoading] = useState(false);
  const [dialog, setDialog] = useState<string>("");
  const [messages, setMessages] = useState<ChatGPTMessage[]>([
    { role: "system", content: "You are NPC in a video game." },
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

  const isReadyForGeneration =
    messages.slice(-1)[0]?.role === "user" && !isLoading;

  return (
    <div className="flex w-full flex-col items-center justify-center gap-4">
      {character && <LexicaImage character={character}/>}
      <h2 className="text-2xl font-bold text-white">{`Speak with ${character?.name}!`}</h2>
      <div className="my-2 flex w-full flex-col items-center justify-center space-y-10">
        <Messages messages={liveMessages} />
        <AddMessage
          onAdd={(message) => {
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

function AddMessage({ onAdd }: { onAdd: (msg: ChatGPTMessage) => void }) {
  const [content, setContent] = useState("");
  const addMessage = () => {
    onAdd({ role: "user", content });
    setContent("");
  };
  return (
    <div className="flex h-12 gap-2">
      <input
        className="w-96 rounded-md border-2 border-zinc-800 px-4 py-2 text-black focus:outline-none"
        placeholder="Have your say.."
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
      <Button disabled={!content.trim()} onClick={addMessage}>
        Add
      </Button>
    </div>
  );
}

function Messages({ messages }: { messages: ChatGPTMessage[] }) {
  console.log("messages", messages);
  return (
    <div>
      {messages.slice(2).map(({ content, role }, index) => (
        <TextBox
          key={index}
          className={
            role === "assistant"
              ? "bg-purple-500 text-white hover:bg-purple-400"
              : "bg-white text-black hover:bg-gray-100"
          }
        >
          {content}
        </TextBox>
      ))}
    </div>
  );
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
