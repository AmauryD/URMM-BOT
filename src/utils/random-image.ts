import { PexelClient } from "../pexel-client";
import { randomElement } from "./random-element";
import { randomBetween } from "./random-number";

export async function randomImage(keywords: string[], randomRange = 100) {
  const query = {
    query: randomElement(keywords),
    per_page: 1,
  };

  const images: Record<string, any> = await PexelClient.Client.photos.search(
    query
  );

  const total = images.total_results;
  const page = randomBetween(1, Math.min(total, randomRange));

  const { photos }: Record<string, any> =
    await PexelClient.Client.photos.search({
      ...query,
      page,
    });

  return photos;
}
