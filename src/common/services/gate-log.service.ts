import { BaseService } from './base.service';
import { Prisma, GateLogs } from '.prisma/client';
import { APIError } from '@common/error/api.error';
import { ErrorCode, ErrorKey } from '@common/errors';
import { deleteFileSystem } from '@common/helpers/delete-file-system';
import { IIdResponse, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { IGateLog } from '@common/interfaces/gate-log.interface';
import { IShippingPlan } from '@common/interfaces/shipping-plan.interface';
import { EmployeeRepo } from '@common/repositories/employee.repo';
import { GateLogRepo } from '@common/repositories/gate-log.repo';
import { InventoryRepo } from '@common/repositories/inventory.repo';
import { UserRepo } from '@common/repositories/user.repo';
import { CommonApproveStatus } from '@config/app.constant';

export class GateLogService extends BaseService<GateLogs, Prisma.GateLogsSelect, Prisma.GateLogsWhereInput> {
    private static instance: GateLogService;
    private inventoryRepo: InventoryRepo = new InventoryRepo();
    private userRepo: UserRepo = new UserRepo();

    private constructor() {
        super(new GateLogRepo());
    }

    public static getInstance(): GateLogService {
        if (!this.instance) {
            this.instance = new GateLogService();
        }
        return this.instance;
    }

    public async assignEmployee(id: number, body: Partial<IGateLog>): Promise<IIdResponse> {
        await this.findById(id);
        // await this.validateForeignKeys(body, {
        //     employee_id: this.employeeRepo,
        // });
        await this.repo.update({ id }, { status: CommonApproveStatus.CONFIRMED, employee_id: body.employee_id });
        return { id };
    }

    public async updateGateLog(
        id: number,
        body: Partial<IGateLog>,
        isAdmin: boolean,
        userId: number,
    ): Promise<IIdResponse> {
        // const gateLog = await this.canEdit(id, 'gate_log', isAdmin);
        const gateLog = await this.findById(id);
        if (!gateLog) return { id };

        const { employee_id, ...restBody } = body;
        // check xem đã cập nhật hay chưa
        let dataUpdate = { ...restBody }
        if (!isAdmin) {
            Object.keys(dataUpdate).forEach((key) => {
                const keyAsGateLogKey = key as keyof typeof gateLog;
                if (gateLog[keyAsGateLogKey] !== null && gateLog[keyAsGateLogKey] !== undefined && gateLog[keyAsGateLogKey] !== '') {
                    delete dataUpdate[key as keyof typeof dataUpdate];
                }
            });
        }

        let employeeId = null;
        if (gateLog.employee_id === null) {
            const userInfo = await this.userRepo.findFirst({ id: userId });
            if (userInfo) {
                employeeId = userInfo.employee_id;
            }
        }

        const imagesToRemove = this.getReplacedImages(gateLog, body);

        await this.repo.update(
            { id },
            { ...dataUpdate, ...(employeeId && { employee_id: employeeId }) },
        );

        if (imagesToRemove.length > 0) {
            deleteFileSystem(imagesToRemove);
        }

        return { id };
    }

    private getReplacedImages(current: Partial<GateLogs>, updates: Partial<IGateLog>): string[] {
        const imageFields: (keyof IGateLog & keyof GateLogs)[] = [
            'entry_plate_image',
            'entry_container_image',
            'exit_plate_image',
            'exit_container_image',
        ];

        return imageFields
            .filter((field) => {
                const newImage = updates[field];
                const currentImage = current[field];
                return newImage && currentImage && currentImage !== newImage;
            })
            .map((field) => current[field] as string)
            .filter(Boolean);
    }

    public async approve(id: number, body: IGateLog): Promise<IIdResponse> {
        await this.validateStatusApprove(id);
        await this.repo.update({ id }, body);

        return { id };
    }

    public async connect(body: IGateLog): Promise<IIdResponse> {
        const { children_id, parent_id } = body;

        // await this.validateForeignKeys(body, {
        //     children_id: this.repo,
        //     parent_id: this.repo,
        // });

        const children = await this.findOne({ id: children_id });
        const parent = await this.findOne({ id: parent_id });

        await this.repo.updateMany([
            { id: children_id, idx: children_id, entry_time: parent?.entry_time },
            { id: parent_id, idx: children_id }
        ])

        return { id: children_id || 0 };
    }
}
