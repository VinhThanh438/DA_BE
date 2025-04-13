import { DeviceRequests, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { RequestStatus } from '@config/app.constant';
import { UserSelectionWithoutPassword } from './user.repo';
import { ICreateAndUpdateResponse } from '@common/interfaces/common.interface';

export const DeviceRequestSelection: Prisma.DeviceRequestsSelect = {
    id: true,
    device_uid: true,
    status: true,
    ip_address: true,
    user_agent: true,
    user: {
        select: UserSelectionWithoutPassword,
    },
};

export class DeviceRequestRepo {
    private static db = DatabaseAdapter.getInstance().deviceRequests;

    public static async delete(id: number): Promise<Partial<DeviceRequests> | null> {
        return this.db.delete({
            where: { id },
        });
    }

    public static async findOne(where: Prisma.DeviceRequestsWhereInput): Promise<DeviceRequests | null> {
        return this.db.findFirst({
            where,
        });
    }

    public static async create(data: any): Promise<DeviceRequests> {
        return this.db.create({
            data,
            include: {
                user: true,
            },
        });
    }

    public static async getAll(): Promise<DeviceRequests[]> {
        return this.db.findMany({
            where: {
                status: RequestStatus.PENDING,
            },
            select: DeviceRequestSelection,
        });
    }

    public static async update(
        id: number,
        status: RequestStatus,
        approvedId?: number,
    ): Promise<Partial<ICreateAndUpdateResponse>> {
        const updateData = await this.db.update({
            where: { id },
            data: {
                status,
                approved_id: approvedId || null,
                updated_at: new Date(),
            },
            include: {
                user: true,
            },
        });
        return { id: updateData.id, userId: updateData.user_id };
    }
}
