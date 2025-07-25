import { IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { AreaRepo } from '@common/repositories/area.repo';
import { Prisma, Areas } from '.prisma/client';
import { BaseService } from './base.service';

export class AreasService extends BaseService<Areas, Prisma.AreasSelect, Prisma.AreasWhereInput> {
    private static instance: AreasService;

    private constructor() {
        super(new AreaRepo());
    }

    static getInstance(): AreasService {
        if (!this.instance) {
            this.instance = new AreasService();
        }
        return this.instance;
    }

    public paginate(query: IPaginationInput): Promise<IPaginationResponse> {
        delete query.organizationId;
        delete query.OR;
        return this.repo.paginate(query);
    }
}
