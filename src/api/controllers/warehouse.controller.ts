import { BaseController } from './base.controller';
import { Warehouses } from '.prisma/client';
import { WarehouseService } from '@common/services/master/warehouse.service';

export class WarehouseController extends BaseController<Warehouses> {
    private static instance: WarehouseController;
    protected service: WarehouseService;

    private constructor() {
        super(WarehouseService.getInstance());
        this.service = WarehouseService.getInstance();
    }

    public static getInstance(): WarehouseController {
        if (!this.instance) {
            this.instance = new WarehouseController();
        }
        return this.instance;
    }
}
