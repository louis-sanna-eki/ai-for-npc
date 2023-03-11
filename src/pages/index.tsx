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

  const { data: secretMessage } = api.example.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined },
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
            <p>{character.name}: {stringify(character?.data)}</p>
          </div>
        )
      })}
    </div>
  );
}

const CreateCharacterForm: React.FC = () => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const {status} = useSession();

  const utils = api.useContext();
  const createCharacter = api.character.create.useMutation({
    onMutate: async (newCharacterElement) => {
      await utils.character.getAll.cancel();
      const createdAt = new Date();
      const newCharacter = {
        name: newCharacterElement.name,
        data: {message: newCharacterElement.message},
        createdAt,
        updatedAt: createdAt,
        id: "",
        userId: "",
      }
      utils.character.getAll.setData(undefined, (prevCharacters) => {
        if (prevCharacters) {
          return [...prevCharacters, newCharacter]
        } else {
          return [newCharacter];
        }
      })
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
        createCharacter.mutate({name, message});
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
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none"
    >
      Create
    </button>
    </form>
  )
}
