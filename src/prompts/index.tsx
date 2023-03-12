export { buildPrompt };
export type { Action, CharacterInfo as CharacterData, Context, Template };

interface CharacterInfo {
  name: string;
  age: 30;
  occupation: string;
  interests: string;
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
  playerOpinion: string;
  playerDescription: string;
  playerName: string;
  historySummary: string;
  actions: Action[];
}

function buildPrompt(template: Template) {
  const {
    character,
    playerOpinion,
    playerDescription,
    playerName,
    historySummary,
  } = template;

  const characterDescription = buildCharacterDescription(template);

  const interactionSummary = `
Your first impression of me is ${playerOpinion}
You know my name, it is ${playerName}.
My description is ${playerDescription}
Here is a summary of our interactions until then: ${historySummary}`;

  const prompt = `You will be playing the role of a character, like in a play or a movie, or a video game! 

${characterDescription}

${interactionSummary}

You will first greet me.
if you decide to shoot action = [ATTACK]; 
if you make me an offer to spare me and I accept, action = [JOIN PARTY]; 

Stay in character! No description of any kind, no stage directions, only dialogue, only speak ${character.name} lines.

The lines should be lively, engaging, dynamic and witty.

// BAD ANSWER
${character.name}: "Hello there, what can I do for you today?"

// GOOD ANSWER
Hello there, what can I do for you today?
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
