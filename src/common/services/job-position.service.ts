import { BaseService } from './base.service';
import { JobPositions, Prisma } from '.prisma/client';
import { IIdResponse } from '@common/interfaces/common.interface';
import { ICreateUpdateJobPosition } from '@common/interfaces/company.interface';
import { JobPositionRepo } from '@common/repositories/job-position.repo';
import { PositionRepo } from '@common/repositories/position.repo';
import { OrganizationRepo } from '@common/repositories/organization.repo';
import { APIError } from '@common/error/api.error';
import { ErrorCode } from '@common/errors';

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

    private async checkExistId(positionId?: number, organizationId?: number): Promise<void> {
        if (positionId) {
            const existedPosition = await this.positionRepo.findOne({ id: positionId });
            if (!existedPosition) {
                throw new APIError({
                    message: 'position.common.not-found',
                    status: ErrorCode.BAD_REQUEST,
                });
            }
        }

        if (organizationId) {
            const existedOrganization = await this.organizationRepo.findOne({ id: organizationId });
            if (!existedOrganization) {
                throw new APIError({
                    message: 'organization.common.not-found',
                    status: ErrorCode.BAD_REQUEST,
                });
            }
        }
    }

    public async create(request: ICreateUpdateJobPosition): Promise<IIdResponse> {
        await this.checkExistId(request.position_id, request.organization_id);
        const id = await this.repo.create(request);
        return { id };
    }

    public async update(id: number, data: ICreateUpdateJobPosition): Promise<IIdResponse> {
        await this.checkExistId(data.position_id, data.organization_id);
        const updatedId = await this.repo.update({ id }, data);
        return { id: updatedId };
    }
}
