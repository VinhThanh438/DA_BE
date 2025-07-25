import eventbus from '@common/eventbus';
import { IJobSendPendingEmailData } from '@common/interfaces/common.interface';
import logger from '@common/logger';
import { QueueService } from '@common/services/queue.service';
import { EVENT_DEVICE_PENDING_APPROVAL } from '@config/event.constant';
import { SEND_PENDING_MAIL_JOB } from '@config/job.constant';

export class DeviceRequestEvent {
    /**
     * Register device pending approval event
     */
    static register(): void {
        eventbus.on(EVENT_DEVICE_PENDING_APPROVAL, this.sendPendingMail);
    }

    private static async sendPendingMail(data: any): Promise<void> {
        try {
            await (
                await QueueService.getQueue(SEND_PENDING_MAIL_JOB)
            ).add(SEND_PENDING_MAIL_JOB, {
                email: data.email,
                name: data.name,
            });
            logger.info('DevicePendingApprovalEvent.sendPendingMail: Added send mail job successfully!');
        } catch (error: any) {
            logger.error('DevicePendingApprovalEvent.sendPendingMail:', error.message);
        }
    }
}
