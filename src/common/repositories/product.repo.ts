import { Prisma, Products } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { IFilterArgs, IPaginationInput, IPaginationResponse, SearchField } from '@common/interfaces/common.interface';
import { ProductType } from '@config/app.constant';
import { ProductSelection, ProductSelectionAll } from './prisma/prisma.select';

export class ProductRepo extends BaseRepo<Products, Prisma.ProductsSelect, Prisma.ProductsWhereInput> {
    protected db = DatabaseAdapter.getInstance().getClient().products;
    protected defaultSelect = ProductSelection;
    protected detailSelect = ProductSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'products';
    protected searchableFields: Record<string, SearchField[]> = {
        basic: [{ path: ['name'] }, { path: ['code'] }],
    };

    async paginate(
        { page, size, keyword, startAt, endAt, ...args }: Partial<IPaginationInput>,
        includeRelations?: boolean,
    ): Promise<IPaginationResponse> {
        const { productIds, supplierIds, employeeIds, unitId, isPublic, type, hasMesh, warehouseId, ...restQuery } =
            args as IFilterArgs;

        const customWhere: Prisma.ProductsWhereInput = {
            ...(supplierIds?.length && {
                partner_id: { in: supplierIds },
            }),
            ...(employeeIds?.length && {
                employee_id: { in: employeeIds },
            }),
            ...(unitId && {
                OR: [{ unit_id: unitId }, { extra_units: { some: { unit_id: unitId } } }],
            }),
            ...(isPublic && { is_public: isPublic }),
            ...(type && {
                type: type === ProductType.MATERIAL ? { in: ['main_material', 'sub_material'] } : (type as any),
            }),
            ...(hasMesh &&
                ['false', 'true'].includes(hasMesh?.toString()) &&
                (hasMesh?.toString() === 'true' ? { mesh: { isNot: null } } : { mesh: null })),
            ...(warehouseId && {
                stock_trackings: {
                    some: {
                        warehouse_id: warehouseId,
                    },
                },
            }),
        };

        return super.paginate(
            {
                page,
                size,
                keyword,
                startAt,
                endAt,
                ...restQuery,
            },
            includeRelations,
            customWhere,
        );
    }
}
