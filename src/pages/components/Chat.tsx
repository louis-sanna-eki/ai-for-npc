import { useState } from "react";
import Button from "./Button";

export default function Chat({ prompt }: { prompt: string }) {
  const [loading, setLoading] = useState(false);
  const [dialogue, setDialogue] = useState<String>("");

  const generateDialogue = async (e: any) => {
    e.preventDefault();
    setDialogue("");
    setLoading(true);
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
      }),
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
      setDialogue((prev) => prev + chunkValue);
    }
    setLoading(false);
  };
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <Button
          // className="mt-8 w-40 rounded-xl bg-black px-4 py-2 font-medium text-white hover:bg-black/80 sm:mt-10"
          disabled={loading}
          onClick={(e) => generateDialogue(e)}
        >
          {loading ? "..." : "Generate"}
        </Button>
      <div className="my-2 space-y-10">
        {dialogue && (
          <>
            <div className="mx-auto flex max-w-xl flex-col items-center justify-center space-y-8">
              <div className="cursor-copy rounded-xl border bg-white p-4 text-black shadow-md transition hover:bg-gray-100">
                {dialogue}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
