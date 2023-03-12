import { useEffect, useState } from 'react';

export async function fetchSearchResults(query: string) {
  const response = await window.fetch(`https://lexica.art/api/v1/search?q=${query}`);
  const data = await response.json();
  const firstImage = data.images[0]; // extract the first image object
  return {
    id: firstImage.id,
    src: firstImage.src,
    prompt: firstImage.prompt,
    width: firstImage.width,
    height: firstImage.height
  }; // return an object with relevant properties of the first image
}