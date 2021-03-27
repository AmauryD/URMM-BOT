import { EntityRepository, Repository } from "typeorm";
import { Tour } from "../models/tour";

@EntityRepository(Tour)
export class TourRepository extends Repository<Tour> {
  getLastTourBuilder(pollId: string) {
    console.log(pollId);
    return this.createQueryBuilder("tour")
      .innerJoinAndSelect("tour.poll", "poll")
      .select("MAX(tour.number)")
      .where(`poll.id = '${pollId}'`);
  }
}
