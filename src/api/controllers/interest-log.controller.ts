import { InterestLogService } from '@common/services/interest-log.service';
import { BaseController } from './base.controller';
import { InterestLogs } from '.prisma/client';

export class InterestLogController extends BaseController<InterestLogs> {
    private static instance: InterestLogController;
    protected service: InterestLogService;

    private constructor() {
        super(InterestLogService.getInstance());
        this.service = InterestLogService.getInstance();
    }

    public static getInstance(): InterestLogController {
        if (!this.instance) {
            this.instance = new InterestLogController();
        }
        return this.instance;
    }
}
