import { randomBetween } from "./random-number";

export const randomElement = <K>(array: K[]): K => {
  return array[randomBetween(array.length - 1, 0)];
};
