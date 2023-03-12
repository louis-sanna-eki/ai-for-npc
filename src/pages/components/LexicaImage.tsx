import { Character } from '@prisma/client';
import { Dict } from '@trpc/server';
import React, { useEffect, useState } from 'react';
import { buildImagePrompt, Template } from '~/prompts';


function LexicaImage({ character }: { character: Character }) {
    const [imageData, setImageData] = useState<{
        id: string;
        src: string;
        prompt: string;
        width: number;
        height: number;
    } | null>(null);

    const info = Object.values((character?.data as unknown as Template)?.character).join(' ');



    useEffect(() => {
        async function searchImages() {
            console.log("info", info);
            const result = await fetch("/api/image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: "NPC portrait " + info }) });
            console.log("result", await result.json());
            setImageData(await result.json());
        }

        searchImages();
    }, [info]);

    return (
        <div style={{ borderRadius: '50%', overflow: 'hidden', width: 200, height: 200 }}>
        {imageData && <img src={imageData.src} alt={imageData.prompt} style={{ width: '100%', height: 'auto' }} />}
        </div>
    );
};

export default LexicaImage;