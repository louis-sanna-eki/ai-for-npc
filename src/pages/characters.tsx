import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { api } from "~/utils/api";
import Button from "./components/Button";
import Layout from "./components/Layout";
import MySlider from "./components/MySlider";

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

interface CharacterData {
  name: string;
  age: number;
  occupation: string;
  interests: string;
}

interface Template {
  character: CharacterData;
  playerDescription: string;
  playerName: string;
  historySummary: string;
  actions: {
    condition: string;
    tag: string;
  }[];
}

const CreateCharacterForm: React.FC = () => {
  const router = useRouter();

  const goToChat = (id: string | undefined) => {
    router.push("/chat" + (id !== undefined ? `?characterId=${id}` : ""));
  };

  const [name, setName] = useState("");
  const [age, setAge] = useState<number>();
  const [occupation, setOccupation] = useState("");
  const [interests, setInterests] = useState("");
  const [playerDescription, setPlayerDescription] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [historySummary, setHistorySummary] = useState("");
  const [actions, setActions] = useState<{ condition: string; tag: string }[]>(
    []
  );
  const { attributes } = getAttributes();
  const [traits, setTraits] = useState<string[]>(
    attributes.map(({ values }) => values[0]?.adjective ?? "")
  );
  const { status } = useSession();

  const utils = api.useContext();
  const createCharacter = api.character.create.useMutation({
    onSettled: async (newCharacter) => {
      await utils.character.getAll.invalidate();
      goToChat(newCharacter?.id);
    },
  });

  if (status !== "authenticated") return null;

  return (
    <form
      className="flex w-96 flex-col gap-2 pb-12"
      onSubmit={(event) => {
        event.preventDefault();
        createCharacter.mutate({
          name,
          data: {
            character: {
              name,
              age,
              occupation,
              interests,
              traits,
            },
            playerDescription,
            playerName,
            historySummary,
            actions,
          } as Template,
        });
        setName("");
        setAge(0);
        setOccupation("");
        setInterests("");
        setPlayerDescription("");
        setHistorySummary("");
        setActions([]);
      }}
    >
      <label className="font-bold text-white">Non Playing Character:</label>
      <input
        type="text"
        className="rounded-md border-2 border-zinc-800 px-4 py-2 focus:outline-none"
        placeholder="Name"
        minLength={2}
        maxLength={100}
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <input
        type="number"
        className="rounded-md border-2 border-zinc-800 px-4 py-2 focus:outline-none"
        placeholder="Age"
        value={age}
        onChange={(event) => setAge(parseInt(event.target.value))}
      />
      <input
        type="text"
        className="rounded-md border-2 border-zinc-800 px-4 py-2 focus:outline-none"
        placeholder="Occupation"
        value={occupation}
        onChange={(event) => setOccupation(event.target.value)}
      />
      <input
        type="text"
        className="rounded-md border-2 border-zinc-800 px-4 py-2 focus:outline-none"
        placeholder="Interests"
        value={interests}
        onChange={(event) => setInterests(event.target.value)}
      />
      <Personality traits={traits} setTraits={setTraits} />
      <label className="font-bold text-white">Your character:</label>
      <input
        type="text"
        className="rounded-md border-2 border-zinc-800 px-4 py-2 focus:outline-none"
        placeholder="Player Description"
        value={playerDescription}
        onChange={(event) => setPlayerDescription(event.target.value)}
      />
      <input
        type="text"
        className="focus: rounded-md border-2 border-zinc-800 px-4 py-2"
        placeholder="Player Name"
        value={playerName}
        onChange={(event) => setPlayerName(event.target.value)}
      />
      <label className="font-bold text-white">Universe:</label>
      <input
        type="text"
        className="rounded-md border-2 border-zinc-800 px-4 py-2 focus:outline-none"
        placeholder="History Summary"
        value={historySummary}
        onChange={(event) => setHistorySummary(event.target.value)}
      />
      <div>
        <label className="mr-4 font-bold text-white">Actions:</label>
        {actions.map((action, index) => (
          <div key={index} className="mt-1 flex items-center gap-2">
            <input
              type="text"
              className="rounded-md border-2 border-zinc-800 px-4 py-2 focus:outline-none"
              placeholder="Condition"
              value={action.condition}
              onChange={(event) =>
                setActions([
                  ...actions.slice(0, index),
                  { condition: event.target.value, tag: action.tag },
                  ...actions.slice(index + 1),
                ])
              }
            />
            <input
              type="text"
              className="rounded-md border-2 border-zinc-800 px-4 py-2 focus:outline-none"
              placeholder="Tag"
              value={action.tag}
              onChange={(event) =>
                setActions([
                  ...actions.slice(0, index),
                  { condition: action.condition, tag: event.target.value },
                  ...actions.slice(index + 1),
                ])
              }
            />
            <button
              type="button"
              className="rounded-md bg-red-500 py-2 px-4 font-bold text-white hover:bg-red-700 focus:outline-none"
              onClick={() =>
                setActions([
                  ...actions.slice(0, index),
                  ...actions.slice(index + 1),
                ])
              }
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="my-2 rounded-md bg-purple-400 py-2 px-4 font-bold text-white hover:bg-purple-500 focus:outline-none"
          onClick={() => setActions([...actions, { condition: "", tag: "" }])}
        >
          Add Action
        </button>
      </div>
      <Button
        type="submit"
        className="rounded-md bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700 focus:outline-none"
      >
        Create
      </Button>
    </form>
  );
};

function Personality({
  traits,
  setTraits,
}: {
  traits: string[];
  setTraits: any;
}) {
  const { attributes } = getAttributes();
  return (
    <>
      <label className="font-bold text-white">NPC traits:</label>
      {attributes.map(({ name, values }, index) => {
        const marks = values.map(({ adjective }) => ({
          value: adjective,
          label: adjective,
        }));
        return (
          <>
            <label key={name} className="text-white">
              {name}
            </label>
            <MySlider
              key={name + "slider"}
              marks={marks}
              onChange={(e: any, newValueIndex: any) => {
                setTraits([
                  ...traits.slice(0, index),
                  marks[newValueIndex]?.value ?? "",
                  ...traits.slice(index + 1),
                ]);
              }}
            />
          </>
        );
      })}
    </>
  );
}

function getAttributes() {
  return {
    attributes: [
      {
        name: "Boldness",
        values: [
          {
            adjective: "Spineless",
            noun: "Craven",
          },
          {
            adjective: "Cowardly",
            noun: "Coward",
          },
          {
            adjective: "Bold",
            noun: "Gambler",
          },
          {
            adjective: "Fearless",
            noun: "Adventurer",
          },
        ],
      },
      {
        name: "Compassion",
        values: [
          {
            adjective: "Evil",
            noun: "Villain",
          },
          {
            adjective: "Callous",
            noun: "Brute",
          },
          {
            adjective: "Compassionate",
            noun: "Altruist",
          },
          {
            adjective: "Gracious",
            noun: "Empath",
          },
        ],
      },
      {
        name: "Greed",
        values: [
          {
            adjective: "Content",
            noun: "Lackey",
          },
          {
            adjective: "Content",
            noun: "Follower",
          },
          {
            adjective: "Covetous",
            noun: "Grasper",
          },
          {
            adjective: "Rapacious",
            noun: "Ravener",
          },
        ],
      },
      {
        name: "Honor",
        values: [
          {
            adjective: "Treacherous",
            noun: "Blackguard",
          },
          {
            adjective: "Dishonorable",
            noun: "Knave",
          },
          {
            adjective: "Honorable",
            noun: "Gentleman / Gentlewoman",
          },
          {
            adjective: "Righteous",
            noun: "Paragon",
          },
        ],
      },
      {
        name: "Rationality",
        values: [
          {
            adjective: "Insane",
            noun: "Maniac",
          },
          {
            adjective: "Irrational",
            noun: "Fool",
          },
          {
            adjective: "Rational",
            noun: "Thinker",
          },
          {
            adjective: "Analytic",
            noun: "Planner",
          },
        ],
      },
      {
        name: "Vengefulness",
        values: [
          {
            adjective: "Magnanimous",
            noun: "Absolver",
          },
          {
            adjective: "Forgiving",
            noun: "Conciliator",
          },
          {
            adjective: "Resentful",
            noun: "Quarreler",
          },
          {
            adjective: "Vindictive",
            noun: "Antagonist",
          },
        ],
      },
      {
        name: "Zeal",
        values: [
          {
            adjective: "Godless",
            noun: "Atheist",
          },
          {
            adjective: "Cynical",
            noun: "Unbeliever",
          },
          {
            adjective: "Religious",
            noun: "Believer",
          },
          {
            adjective: "Zealous",
            noun: "Zealot",
          },
        ],
      },
    ],
  };
}
