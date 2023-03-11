import { ChatGPTMessage, OpenAIStream, OpenAIStreamPayload } from '../../utils/OpenAIStream'


if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing env var from OpenAI')
}

export const runtime = 'edge'

export default async function handler(req: Request) {
  const { messages } = (await req.json()) as {
    messages?: ChatGPTMessage[];
  };

  if (!messages) {
    return new Response("No prompt in the request", { status: 400 });
  }

  const payload: OpenAIStreamPayload = {
    model: 'gpt-3.5-turbo',
    messages,
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 200,
    stream: true,
    n: 1,
  }

  const stream = await OpenAIStream(payload)
  return new Response(stream)
}