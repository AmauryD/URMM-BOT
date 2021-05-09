import { CronJob } from "cron";

export class CronJobManager {
  private static _crons: Record<string, CronJob> = {};

  public static register(name: string, period: string, job: () => void) {
    const cron = new CronJob(period, job);
    this._crons[name] = cron;
    cron.start();
    return cron;
  }
}
