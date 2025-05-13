import { PartnerGroupService } from '@common/services/partner-group.service';
import { BaseController } from './base.controller';

export class PartnerGroupController extends BaseController {
    private static instance: PartnerGroupController;
    protected service: PartnerGroupService;

    private constructor() {
        super(PartnerGroupService.getInstance());
        this.service = PartnerGroupService.getInstance();
    }

    public static getInstance(): PartnerGroupController {
        if (!this.instance) {
            this.instance = new PartnerGroupController();
        }
        return this.instance;
    }
}
