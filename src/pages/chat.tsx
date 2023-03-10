import { Character } from "@prisma/client";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { api } from "~/utils/api";
import Dialog from "./components/Dialog";
import Layout from "./components/Layout";
import { useQueryState } from "next-usequerystate";

const Chat: NextPage = () => {
  const { data: sessionData } = useSession();

  const { data: characters, isLoading } = api.character.getAll.useQuery();
  const [selectedCharacterId, setSelectedCharacterId] =
    useQueryState("characterId");
  const currentCharacter = characters?.find(
    ({ id }) => id === selectedCharacterId
  );

  useEffect(() => {
    if (selectedCharacterId !== null) return;
    if (characters === undefined) return;
    const firstCharacter = characters[0];
    if (firstCharacter === undefined) return;
    setSelectedCharacterId(firstCharacter.id);
  }, [characters]);

  // if not authenticated, don't show anything
  if (!sessionData?.user) {
    return null;
  }

  return (
    <Layout>
      <div className="flex w-full">
        <CharacterList
          characters={characters ?? []}
          selectedCharacterId={selectedCharacterId || undefined}
          setSelectedCharacterId={(newId) => setSelectedCharacterId(`${newId}`)}
        />
        <div className="flex w-full items-center justify-center pt-16 text-white">
          {currentCharacter ? (
            <Dialog key={selectedCharacterId} character={currentCharacter} />
          ) : (
            <span className="font-bold">Select a Character</span>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Chat;

function CharacterList({
  characters,
  selectedCharacterId,
  setSelectedCharacterId,
}: {
  characters: Character[];
  selectedCharacterId: string | undefined;
  setSelectedCharacterId: Dispatch<SetStateAction<string | undefined>>;
}) {
  return (
    <div className="flex h-screen w-1/6 flex-col bg-gray-200 p-4">
      <h1 className="mb-2 text-2xl font-bold">Characters</h1>
      <p className="mb-2">Select a character:</p>
      <ul className="overflow-auto">
        {characters.map((character) => (
          <li
            key={character.id}
            onClick={() => setSelectedCharacterId(character.id)}
            className={`cursor-pointer rounded py-2 px-4 ${
              selectedCharacterId === character.id
                ? "bg-purple-500 text-white"
                : ""
            }`}
          >
            {character.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
