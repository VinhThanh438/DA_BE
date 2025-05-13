import { RepresentativeService } from '@common/services/representative.service';
import { BaseController } from './base.controller';
import { Representatives } from '.prisma/client';

export class RepresentativeController extends BaseController<Representatives> {
    private static instance: RepresentativeController;
    protected service: RepresentativeService;

    private constructor() {
        super(RepresentativeService.getInstance());
        this.service = RepresentativeService.getInstance();
    }

    public static getInstance(): RepresentativeController {
        if (!this.instance) {
            this.instance = new RepresentativeController();
        }
        return this.instance;
    }
}
