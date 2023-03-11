import { ReactNode, useEffect, useMemo, useState } from "react";
import { ChatGPTMessage } from "~/utils/OpenAIStream";
import Button from "./Button";

export default function Chat({ prompt }: { prompt: string }) {
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

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <Button
        disabled={isLoading}
        onClick={(e) => {
          e?.preventDefault();
          generateDialog();
        }}
        className="w-40"
      >
        {isLoading ? <LoadingDots /> : "Start playing"}
      </Button>
      <div className="my-2 space-y-10">
        <Messages messages={liveMessages} />
        <AddMessage
          onAdd={(message) => {
            setMessages((prev) => [...prev, message]);
            generateDialog();
          }}
        />
      </div>
    </div>
  );

  async function generateDialog() {
    setDialog("");
    setIsLoading(true);
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
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

  return (
    <div className="flex h-12 gap-2">
      <input
        type="text"
        className="rounded-md border-2 border-zinc-800 px-4 py-2 text-sm text-black focus:outline-none"
        placeholder="Your character message..."
        minLength={2}
        maxLength={100}
        value={content}
        onChange={(event) => setContent(event.target.value)}
      />
      <Button
        disabled={!content.trim()}
        onClick={() => {
          onAdd({ role: "user", content });
          setContent("");
        }}
      >
        Add
      </Button>
    </div>
  );
}

function Messages({ messages }: { messages: ChatGPTMessage[] }) {
  return (
    <div>
      {messages.map(({ content }) => (
        <TextBox>{content}</TextBox>
      ))}
    </div>
  );
}

function TextBox({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center justify-center space-y-8">
      <div className="cursor-copy rounded-xl border bg-white p-4 text-black shadow-md transition hover:bg-gray-100">
        {children}
      </div>
    </div>
  );
}

function LoadingDots({ loading = true }: { loading?: boolean }): JSX.Element {
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    let intervalId: any;
    if (loading) {
      intervalId = setInterval(() => {
        setDotCount((count) => {
          if (count < 3) {
            return count + 1;
          } else {
            return 1;
          }
        });
      }, 500);
    } else {
      setDotCount(1);
    }
    return () => clearInterval(intervalId);
  }, [loading]);

  return <span>{".".repeat(dotCount)}</span>;
}
