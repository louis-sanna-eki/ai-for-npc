import { Url } from "next/dist/shared/lib/router/router";

export { buildPrompt, buildImagePrompt };
export type { Action, CharacterInfo as CharacterData, Context, Template };

interface CharacterInfo {
  name: string;
  age: number;
  occupation: string;
  interests: string;
  traits: string[];
}

interface Action {
  condition: string;
  tag: string;
}

interface Context {
  playerDescription: string;
  history_summary: string;
}

interface Template {
  character: CharacterInfo;
  playerDescription: string;
  playerName: string;
  historySummary: string;
  actions: Action[];
}

function buildPrompt(template: Template) {
  const { actions, character, playerDescription, playerName, historySummary } =
    template;

  const characterDescription = buildCharacterDescription(template);

  const customActions = (actions ?? []).map((action) => `[${action.tag.toUpperCase()}]`).join(" ");

  const playerSummary = `
You know my name, it is ${playerName}.
My description is ${playerDescription}.

Here is a summary of the history of the universe: ${historySummary}`;

  const prompt = `You will be playing the role of a character, like in a play or a movie, or a video game! 

${characterDescription}

${playerSummary}


The fist word MUST be an action.
Valid actions: [ATTACK] [JOIN PARTY] [NOTHING] ${customActions}

The lines should be lively, engaging, dynamic and witty.

Stay in character! Only speak ${character.name} lines.

// BAD ANSWER
${character.name}: "Hello there, what can I do for you today?" [JUMP]

// BAD ANSWER
Hello there, what can I do for you today?

// GOOD ANSWER
[NOTHING] Hello there, what can I do for you today?
`;

  return prompt;
}

function buildCharacterDescription(template: Template) {
  const { character } = template;
  let result = "Here is the description of your character:\n";
  if (character.name) {
    result += `name: ${character.name}\n`;
  }
  if (character.age) {
    result += `age: ${character.age}\n`;
  }
  if (character.occupation) {
    result += `occupation: ${character.occupation}\n`;
  }
  if (character.interests) {
    result += `interests: ${character.interests}\n`;
  }
  return result;
}

function buildImagePrompt(template: Template) {
  const { character } = template;

  let prompt = "A npc character portrait,";
  if (character.name) {
    prompt += `named ${character.name},\n`;
  }
  if (character.age) {
    prompt += `aged ${character.age}\n,`;
  }
  if (character.interests) {
    prompt += `interests ${character.interests}\n`;
  }
  return prompt;
}
