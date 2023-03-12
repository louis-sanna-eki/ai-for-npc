import { Character } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { Template } from "~/prompts";

const cache = {} as Record<string, ImageInfo>;

interface ImageInfo {
  id: string;
  src: string;
  prompt: string;
  width: number;
  height: number;
}

function LexicaImage({ character }: { character: Character }) {
  const [imageData, setImageData] = useState<ImageInfo | null>(null);

  const info = character?.data ? Object.values(
    (character?.data as unknown as Template)?.character
  ).join(" ") : "placeholder";

  useEffect(() => {
    async function searchImages() {
      const cached = cache[info];
      if (cached) {
        setImageData(cached);
        return;
      }
      const result = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "NPC portrait " + info }),
      });
      result.json().then((image: ImageInfo) => {
        cache[info] = image;
        setImageData(image);
      });
    }

    searchImages();
  }, [info]);

  return (
    <div
      style={{
        borderRadius: "50%",
        overflow: "hidden",
        width: 200,
        height: 200,
      }}
    >
      {imageData && (
        <img
          src={imageData.src}
          alt={imageData.prompt}
          style={{ width: "100%", height: "auto" }}
        />
      )}
    </div>
  );
}

export default LexicaImage;
