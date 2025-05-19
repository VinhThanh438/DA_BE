import { Prisma } from '.prisma/client';
import { UserSelectionWithoutPassword } from './user.select';

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
