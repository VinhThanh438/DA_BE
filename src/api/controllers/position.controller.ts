import { PositionService } from '@common/services/master/position.service';
import { BaseController } from './base.controller';
import { Positions } from '.prisma/client';

export class PositionController extends BaseController<Positions> {
    private static instance: PositionController;
    protected service: PositionService;

    private constructor() {
        super(PositionService.getInstance());
        this.service = PositionService.getInstance();
    }

    public static getInstance(): PositionController {
        if (!this.instance) {
            this.instance = new PositionController();
        }
        return this.instance;
    }
}
