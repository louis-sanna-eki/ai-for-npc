export { buildPrompt };
export type { Action, CharacterInfo as CharacterData, Context, Template }

interface CharacterInfo {
  name: string,
  age: 30,
  occupation: string,
  interests: string,
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
  playerDescription: string
  historySummary: string;
  actions: Action[];
  name: string;
}

function buildPrompt(template: Template): string {
  const characterData = Object.entries(template.character)
    .map(([key, value]) => `- ${key}: ${value}\n`)
    .join("");

  const actions = template.actions
    .map(
      (action) =>
        `If ${action.condition} then end your line with [${action.tag}]`
    )
    .join("\n");

  return `
      You will be playing the role of a character, like in a play or a movie, or a video game!
      
      Here is the description of your character:
      ${characterData}
      
      I am approaching you
      I am ${template.playerDescription}
      
      Your first impression of me is ${template.playerOpinion}
      Here is a summary of our interactions until then: ${template.historySummary}
      You will first greet me.
      ${actions}
      
      Stay in character! No description of any kind, no stage directions, only dialogue, only speak ${template.name} lines.
    `;
}
