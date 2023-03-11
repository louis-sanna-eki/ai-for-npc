import { type NextPage } from "next";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "~/utils/api";
import { useState } from "react";
import Chat from "./components/Chat";

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

export default Home;

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <div className="fixed top-10 right-10 flex items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
      </p>
      <button
        className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
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
            <p>
              {character.name}: {JSON.stringify(character?.data)}
            </p>
            <Chat
              prompt={`Speak in character. Your name is ${
                character.name
              }. Here is some additional data on your character: ${JSON.stringify(
                character?.data
              )}`}
            />
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
