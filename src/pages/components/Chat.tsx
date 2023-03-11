import { useState } from "react";

export default function Chat({ prompt }: { prompt: string }) {
  const [loading, setLoading] = useState(false);
  const [generatedText, setGeneratedText] = useState<String>("");

  const generateBio = async (e: any) => {
    e.preventDefault();
    setGeneratedText("");
    setLoading(true);
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
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
      setGeneratedText((prev) => prev + chunkValue);
    }
    setLoading(false);
  };
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {!loading && (
        <button
          className="mt-8 w-40 rounded-xl bg-black px-4 py-2 font-medium text-white hover:bg-black/80 sm:mt-10"
          onClick={(e) => generateBio(e)}
        >
          Generate
        </button>
      )}
      {loading && (
        <button
          className="mt-8 w-40 rounded-xl bg-black px-4 py-2 font-medium text-white hover:bg-black/80 sm:mt-10"
          disabled
        >
          ...
        </button>
      )}
      <div className="my-2 space-y-10">
        {generatedText && (
          <>
            <div className="mx-auto flex max-w-xl flex-col items-center justify-center space-y-8">
              <div className="cursor-copy rounded-xl border bg-white p-4 text-black shadow-md transition hover:bg-gray-100">
                {generatedText}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
