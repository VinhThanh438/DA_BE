import { NotificationService } from '@common/services/notification.service';
import { BaseController } from './base.controller';

export class NotificationController extends BaseController {
    private static instance: NotificationController;
    protected service: NotificationService;

    private constructor() {
        super(NotificationService.getInstance());
        this.service = NotificationService.getInstance();
    }

    public static getInstance(): NotificationController {
        if (!this.instance) {
            this.instance = new NotificationController();
        }
        return this.instance;
    }
}
