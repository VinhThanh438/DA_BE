import { PartnerService } from '@common/services/partner.service';
import { BaseController } from './base.controller';

export class PartnerController extends BaseController {
    private static instance: PartnerController;
    protected service: PartnerService;

    private constructor() {
        super(PartnerService.getInstance());
        this.service = PartnerService.getInstance();
    }

    public static getInstance(): PartnerController {
        if (!this.instance) {
            this.instance = new PartnerController();
        }
        return this.instance;
    }
}
