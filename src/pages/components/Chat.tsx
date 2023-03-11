import { useState } from "react";

export { Chat };

function Chat({ prompt }: { prompt: string }) {
  const [loading, setLoading] = useState(false);
  const [generatedBios, setGeneratedBios] = useState<String>("");

  const generateBio = async (e: any) => {
    e.preventDefault();
    setGeneratedBios("");
    setLoading(true);
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
      setGeneratedBios((prev) => prev + chunkValue);
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
        {generatedBios && (
          <>
            <div className="mx-auto flex max-w-xl flex-col items-center justify-center space-y-8">
              {generatedBios
                .substring(generatedBios.indexOf("1") + 3)
                .split("2.")
                .map((generatedBio) => {
                  return (
                    <div
                      className="cursor-copy rounded-xl border bg-white p-4 shadow-md transition hover:bg-gray-100 text-black"
                      key={generatedBio}
                    >
                      <p>{generatedBio}</p>
                    </div>
                  );
                })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
