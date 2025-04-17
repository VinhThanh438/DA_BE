import { BaseService } from './base.service';
import { Positions, Prisma } from '.prisma/client';
import { PositionRepo } from '@common/repositories/position.repo';

export class PositionService extends BaseService<Positions, Prisma.PositionsSelect, Prisma.PositionsWhereInput> {
    private static instance: PositionService;

    private constructor() {
        super(new PositionRepo());
    }

    public static getInstance(): PositionService {
        if (!this.instance) {
            this.instance = new PositionService();
        }
        return this.instance;
    }
}
