import { Inventories, InventoryType, Prisma } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { InventoryInventoryDetails, Inventory } from '@common/interfaces/inventory.interface';
import { APIError } from '@common/error/api.error';
import { StatusCode } from '@common/errors';
import moment from 'moment-timezone';
import logger from '@common/logger';
import { OrganizationSelection } from './organization.repo';
import { EmployeeSelection } from './employee.repo';
import { WarehouseSelection } from './warehouse.repo';
import { ProductGroupSelection } from './product-group.repo';
import { ProductSelection } from './product.repo';
import { IPaginationInfo, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { TimeHelper } from '@common/helpers/time.helper';
export const InventorySelect: Prisma.InventoriesSelect = {
    code: true,
    time_at: true,
    id: true,
    type: true,
    note: true,
    files: true,
    license_plate: true,
};
export const InventorySelectAll: Prisma.InventoriesSelect = {
    ...InventorySelect,
    organization: {
        select: OrganizationSelection,
    },
    employee: {
        select: EmployeeSelection,
    },
    inventory_details: {
        select: {
            id: true,
            quantity: true,
            price: true,
            discount: true,
            note: true,
            warehouse: {
                select: WarehouseSelection,
            },
            product: {
                select: ProductSelection,
            },
        },
    },
};
export class InventoryRepo extends BaseRepo<Inventories, Prisma.InventoriesSelect, Prisma.InventoriesWhereInput> {
    protected db = DatabaseAdapter.getInstance().inventories;
    protected defaultSelect = InventorySelect;
    protected detailSelect = InventorySelectAll;
    protected modelKey = 'inventories' as const;
    public async paginate(
        { page, limit, args }: Partial<IPaginationInput>,
        includeRelations: boolean = false,
        query: object = {},
    ): Promise<IPaginationResponse> {
        const currentPage = page ? Number(page) : 1;
        const size = limit ? Number(limit) : 10;
        const skip = (currentPage - 1) * size;

        const [data, totalRecords] = await Promise.all([
            this.db.findMany({
                where: {
                    ...query,
                    time_at: {
                        ...(args?.startAt ? { gte: TimeHelper.parseStartOfDayDate(args.startAt) } : {}),
                        ...(args?.endAt ? { lte: TimeHelper.parseEndOfDayDate(args.endAt) } : {}),
                    },
                },
                select: includeRelations ? this.detailSelect : this.defaultSelect,
                skip,
                take: size,
                orderBy: { id: 'desc' },
            }),
            this.db.count({ where: { ...query } }),
        ]);

        const totalPages = Math.ceil(totalRecords / size);

        return {
            data: data,
            pagination: {
                totalPages: totalPages,
                totalRecords: totalRecords,
                size,
                currentPage: currentPage,
            } as IPaginationInfo,
        };
    }
}
