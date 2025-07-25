import { BaseService } from './master/base.service';
import { JobPositions, Prisma } from '.prisma/client';
import { IIdResponse } from '@common/interfaces/common.interface';
import { ICreateUpdateJobPosition } from '@common/interfaces/organization.interface';
import { JobPositionRepo } from '@common/repositories/job-position.repo';
import { PositionRepo } from '@common/repositories/position.repo';
import { OrganizationRepo } from '@common/repositories/organization.repo';

export class JobPositionService extends BaseService<
    JobPositions,
    Prisma.JobPositionsSelect,
    Prisma.JobPositionsWhereInput
> {
    private static instance: JobPositionService;
    private readonly positionRepo = new PositionRepo();
    private readonly organizationRepo = new OrganizationRepo();

    private constructor() {
        super(new JobPositionRepo());
    }

    public static getInstance(): JobPositionService {
        if (!this.instance) {
            this.instance = new JobPositionService();
        }
        return this.instance;
    }

    public async create(request: ICreateUpdateJobPosition): Promise<IIdResponse> {
        const { position_id, organization_id } = request;
        await this.validateForeignKeys(request, {
            position_id: this.positionRepo,
            organization_id: this.organizationRepo,
        });
        if (position_id) {
            request.position = { connect: { id: position_id } };
            delete request.position_id;
        }
        if (organization_id) {
            request.organization = { connect: { id: organization_id } };
            delete request.organization_id;
        }
        const id = await this.repo.create(request);
        return { id };
    }

    public async update(id: number, request: ICreateUpdateJobPosition): Promise<IIdResponse> {
        await this.validateForeignKeys(request, {
            position_id: this.positionRepo,
            organization_id: this.organizationRepo,
        });
        const updatedId = await this.repo.update({ id }, request);
        return { id: updatedId };
    }
}
