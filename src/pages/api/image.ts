export const runtime = 'edge'

export default async function handler(req: Request) {
    const { query } = (await req.json()) as { query?: string; }
    const response = await fetch(`https://lexica.art/api/v1/search?q=${query}`);
    const data = await response.json();
    const firstImage = data.images[0]; // extract the first image object
    return new Response(
        JSON.stringify({
            id: firstImage.id,
            src: firstImage.src,
            prompt: firstImage.prompt,
            width: firstImage.width,
            height: firstImage.height
        }),
        {
          status: 200,
          headers: {
            'content-type': 'application/json',
          },
        }
      )
}