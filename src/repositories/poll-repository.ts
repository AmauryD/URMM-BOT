import { EntityRepository, Repository } from "typeorm";
import { Poll } from "../models/poll";

@EntityRepository(Poll)
export class PollRepository extends Repository<Poll> {}
