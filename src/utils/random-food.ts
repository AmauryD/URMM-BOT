import { PexelClient } from "../pexel-client";
import { randomElement } from "./random-element";
import { randomBetween } from "./random-number";

const foods = [
  "pizza",
  "burger",
  "food",
  "pasta",
  "steak",
  "sushi",
  "ramen",
  "sandwich",
  "breakfast",
];

export async function randomImage(keywords = foods) {
  const query = {
    query: randomElement(keywords),
    per_page: 1,
  };

  const images: Record<string, any> = await PexelClient.Client.photos.search(
    query
  );

  const total = images.total_results;
  const page = randomBetween(1, Math.min(total, 100));

  const { photos }: Record<string, any> =
    await PexelClient.Client.photos.search({
      ...query,
      page,
    });

  return photos;
}
