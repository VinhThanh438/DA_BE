import { InterestLogRepo } from '@common/repositories/interest-log.repo';
import { BaseService } from './master/base.service';
import { InterestLogs, Prisma } from '.prisma/client';

export class InterestLogService extends BaseService<
    InterestLogs,
    Prisma.InterestLogsSelect,
    Prisma.InterestLogsWhereInput
> {
    private static instance: InterestLogService;

    private constructor() {
        super(new InterestLogRepo());
    }

    public static getInstance(): InterestLogService {
        if (!this.instance) {
            this.instance = new InterestLogService();
        }
        return this.instance;
    }
}
