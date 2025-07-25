import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { Prisma } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { NotificationSelection, NotificationSelectionAll } from './prisma/prisma.select';

export class NotificationRepo extends BaseRepo<
    Notification,
    Prisma.NotificationsSelect,
    Prisma.NotificationsWhereInput
> {
    protected db = DatabaseAdapter.getInstance().getClient().notifications;
    protected defaultSelect = NotificationSelection;
    protected detailSelect = NotificationSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'notifications';
    protected timeFieldDefault: string = 'created_at';
}
