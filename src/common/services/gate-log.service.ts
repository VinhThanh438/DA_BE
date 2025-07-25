import { BaseService } from './master/base.service';
import { Prisma, GateLogs } from '.prisma/client';
import { IIdResponse } from '@common/interfaces/common.interface';
import { IGateLog } from '@common/interfaces/gate-log.interface';
import { GateLogRepo } from '@common/repositories/gate-log.repo';
import { UserRepo } from '@common/repositories/user.repo';
import { CommonApproveStatus } from '@config/app.constant';

export class GateLogService extends BaseService<GateLogs, Prisma.GateLogsSelect, Prisma.GateLogsWhereInput> {
    private static instance: GateLogService;
    private userRepo: UserRepo = new UserRepo();

    private constructor() {
        super(new GateLogRepo());
    }

    static getInstance(): GateLogService {
        if (!this.instance) {
            this.instance = new GateLogService();
        }
        return this.instance;
    }

    async assignEmployee(id: number, body: Partial<IGateLog>): Promise<IIdResponse> {
        await this.findById(id);
        await this.repo.update({ id }, { status: CommonApproveStatus.CONFIRMED, employee_id: body.employee_id });
        return { id };
    }

    async updateGateLog(id: number, body: Partial<IGateLog>, isAdmin: boolean, userId: number): Promise<IIdResponse> {
        const gateLog = await this.findById(id);
        if (!gateLog) return { id };

        const { employee_id, ...restBody } = body;
        // check xem đã cập nhật hay chưa
        let dataUpdate = { ...restBody };
        // if (!isAdmin) {
        //     Object.keys(dataUpdate).forEach((key) => {
        //         const keyAsGateLogKey = key as keyof typeof gateLog;
        //         if (
        //             gateLog[keyAsGateLogKey] !== null &&
        //             gateLog[keyAsGateLogKey] !== undefined &&
        //             gateLog[keyAsGateLogKey] !== ''
        //         ) {
        //             delete dataUpdate[key as keyof typeof dataUpdate];
        //         }
        //     });
        // }

        let employeeId = null;
        if (gateLog.employee_id === null) {
            const userInfo = await this.userRepo.findFirst({ id: userId });
            if (userInfo) {
                employeeId = userInfo.employee_id;
            }
        }

        await this.repo.update({ id }, { ...dataUpdate, ...(employeeId && { employee_id: employeeId }) });

        return { id };
    }

    async approve(id: number, body: IGateLog): Promise<IIdResponse> {
        await this.validateStatusApprove(id);
        await this.repo.update({ id }, body);

        return { id };
    }

    async connect(body: IGateLog): Promise<IIdResponse> {
        const { children_id, parent_id } = body;
        const children = await this.findOne({ id: children_id });
        const parent = await this.findOne({ id: parent_id });

        await this.repo.updateMany([
            { id: children_id, idx: children_id, entry_time: parent?.entry_time },
            { id: parent_id, idx: children_id },
        ]);

        return { id: children_id || 0 };
    }
}
