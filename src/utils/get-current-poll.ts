import { getRepository } from "typeorm";
import { Poll, PollStatus } from "../models/poll";

export default function getCurrentPoll() {
  const pollRepository = getRepository(Poll)!;
  return pollRepository.findOne({
    status: PollStatus.Active,
  });
}
