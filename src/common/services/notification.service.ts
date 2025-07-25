import { BaseService } from './master/base.service';
import { Prisma } from '.prisma/client';
import { NotificationRepo } from '@common/repositories/notification.repo';

export class NotificationService extends BaseService<
    Notification,
    Prisma.NotificationsSelect,
    Prisma.NotificationsWhereInput
> {
    private static instance: NotificationService;

    private constructor() {
        super(new NotificationRepo());
    }

    public static getInstance(): NotificationService {
        if (!this.instance) {
            this.instance = new NotificationService();
        }
        return this.instance;
    }
}
