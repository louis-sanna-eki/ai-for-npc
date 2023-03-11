import { type NextPage } from "next";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "~/utils/api";
import { stringify } from "superjson";
import { useState } from "react";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>AI for NPC</title>
        <meta name="description" content="AI for NPC" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            <span className="text-[hsl(280,100%,70%)]">AI</span> for NPC
          </h1>
          <Chat/>
          <AuthShowcase />
          <div className="flex flex-col items-center gap-2">
            <p className="text-2xl text-white">
              <Characters />
            </p>
            <div className="pt-6">
              <CreateCharacterForm />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

function Chat() {
  const prompt = `Speak as a clownfish`;

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
          className="mt-8 w-full rounded-xl bg-black px-4 py-2 font-medium text-white hover:bg-black/80 sm:mt-10"
          onClick={(e) => generateBio(e)}
        >
          Generate
        </button>
      )}
      {loading && (
        <button
          className="mt-8 w-full rounded-xl bg-black px-4 py-2 font-medium text-white hover:bg-black/80 sm:mt-10"
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
                      className="cursor-copy rounded-xl border bg-white p-4 shadow-md transition hover:bg-gray-100"
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

export default Home;

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = api.example.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
        {secretMessage && <span> - {secretMessage}</span>}
      </p>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};

const Characters: React.FC = () => {
  const { data: sessionData } = useSession();
  const { data: characterEntries, isLoading } = api.character.getAll.useQuery();

  // if not authenticated, don't show anything
  if (!sessionData?.user) {
    return null;
  }
  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-4">
      {characterEntries?.map((character) => {
        return (
          <div key={character.id}>
            <button
              className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
              onClick={() => {}}
            >
              Start Talking!
            </button>
            <p>
              {character.name}: {stringify(character?.data)}
            </p>
          </div>
        );
      })}
    </div>
  );
};

const CreateCharacterForm: React.FC = () => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const { status } = useSession();

  const utils = api.useContext();
  const createCharacter = api.character.create.useMutation({
    onMutate: async (newCharacterElement) => {
      await utils.character.getAll.cancel();
      const createdAt = new Date();
      const newCharacter = {
        name: newCharacterElement.name,
        data: { message: newCharacterElement.message },
        createdAt,
        updatedAt: createdAt,
        id: "",
        userId: "",
      };
      utils.character.getAll.setData(undefined, (prevCharacters) => {
        if (prevCharacters) {
          return [...prevCharacters, newCharacter];
        } else {
          return [newCharacter];
        }
      });
    },
    onSettled: async () => {
      await utils.character.getAll.invalidate();
    },
  });

  if (status !== "authenticated") return null;

  return (
    <form
      className="flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        createCharacter.mutate({ name, message });
        setName("");
        setMessage("");
      }}
    >
      <input
        type="text"
        className="rounded-md border-2 border-zinc-800 px-4 py-2 focus:outline-none"
        placeholder="Your Character Name..."
        minLength={2}
        maxLength={100}
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <input
        type="text"
        className="rounded-md border-2 border-zinc-800 px-4 py-2 focus:outline-none"
        placeholder="Your Character Message..."
        minLength={2}
        maxLength={100}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
      <button
        type="submit"
        className="rounded-md bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700 focus:outline-none"
      >
        Create
      </button>
    </form>
  );
};
