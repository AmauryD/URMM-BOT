import { EntityRepository, Repository } from "typeorm";
import { Tour } from "../models/tour";

@EntityRepository(Tour)
export class TourRepository extends Repository<Tour> {
  getLastTour(pollId: string) {
    return this
      .createQueryBuilder("tour")
      .innerJoinAndSelect("tour.poll", "poll")
      .leftJoinAndSelect("tour.votePropositions", "votePropositions")
      .leftJoinAndSelect("votePropositions.votes", "votes")
      .leftJoinAndSelect("votePropositions.proposition", "proposition")
      .leftJoinAndSelect("tour.tourMessages", "tourMessages")
      .leftJoinAndSelect("tourMessages.server", "server")
      .where("tour.pollId = :pollId", { pollId })
      .orderBy("tour.number", "DESC")
      .getOne();
  }
}
