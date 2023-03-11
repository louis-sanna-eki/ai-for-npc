import { useEffect, useState } from "react";
import Button from "./Button";

export default function Chat({ prompt }: { prompt: string }) {
  const [loading, setLoading] = useState(false);
  const [dialogue, setDialogue] = useState<String>("");

  const generateDialog = async (e: any) => {
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
      <Button disabled={loading} onClick={generateDialog} className="w-40">
        {loading ? <LoadingDots /> : "Start playing"}
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
