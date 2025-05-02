import { WarehouseRepo } from '@common/repositories/warehouse.repo';
import { BaseService } from './base.service';
import { Warehouses, Prisma } from '.prisma/client';

export class WarehouseService extends BaseService<Warehouses, Prisma.WarehousesSelect, Prisma.WarehousesWhereInput> {
    private static instance: WarehouseService;

    private constructor() {
        super(new WarehouseRepo());
    }

    public static getInstance(): WarehouseService {
        if (!this.instance) {
            this.instance = new WarehouseService();
        }
        return this.instance;
    }
}
