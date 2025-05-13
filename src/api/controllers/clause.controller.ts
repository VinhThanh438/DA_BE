import { ClauseService } from '@common/services/clause.service';
import { BaseController } from './base.controller';

export class ClauseController extends BaseController {
    private static instance: ClauseController;
    protected service: ClauseService;

    private constructor() {
        super(ClauseService.getInstance());
        this.service = ClauseService.getInstance();
    }

    public static getInstance(): ClauseController {
        if (!this.instance) {
            this.instance = new ClauseController();
        }
        return this.instance;
    }
}
