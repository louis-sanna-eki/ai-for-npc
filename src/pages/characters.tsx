import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { api } from "~/utils/api";
import Button from "./components/Button";
import Layout from "./components/Layout";

const Characters: NextPage = () => {
  const { data: sessionData } = useSession();

  // if not authenticated, don't show anything
  if (!sessionData?.user) {
    return null;
  }

  return (
    <Layout>
      <div className="flex flex-col items-center gap-2">
          <div className="pt-6">
            <CreateCharacterForm />
          </div>
        </div>
    </Layout>
  );
};

export default Characters;


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
      className="flex flex-col gap-2 w-96"
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
      <Button
        type="submit"
        className="rounded-md bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700 focus:outline-none"
      >
        Create
      </Button>
    </form>
  );
};
