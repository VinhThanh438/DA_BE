import { BaseService } from './base.service';
import { Inventories, Prisma } from '.prisma/client';
import { APIError } from '@common/error/api.error';
import { StatusCode, ErrorCode, ErrorKey } from '@common/errors';
import { IIdResponse } from '@common/interfaces/common.interface';
import { IInventory } from '@common/interfaces/inventory.interface';
import { CommonDetailRepo } from '@common/repositories/common-detail.repo';
import { EmployeeRepo } from '@common/repositories/employee.repo';
import { InventoryRepo } from '@common/repositories/inventory.repo';
import { OrderRepo } from '@common/repositories/order.repo';
import { OrganizationRepo } from '@common/repositories/organization.repo';
import { PartnerRepo } from '@common/repositories/partner.repo';
import { ProductRepo } from '@common/repositories/product.repo';
import { UnitRepo } from '@common/repositories/unit.repo';
import { WarehouseRepo } from '@common/repositories/warehouse.repo';
import { DEFAULT_EXCLUDED_FIELDS } from '@config/app.constant';

export class InventoryService extends BaseService<Inventories, Prisma.InventoriesSelect, Prisma.InventoriesWhereInput> {
    private static instance: InventoryService;
    private inventoryDetailRepo: CommonDetailRepo = new CommonDetailRepo();
    private partnerRepo: PartnerRepo = new PartnerRepo();
    private employeeRepo: EmployeeRepo = new EmployeeRepo();
    private organizationRepo: OrganizationRepo = new OrganizationRepo();
    private orderRepo: OrderRepo = new OrderRepo();
    private warehouseRepo: WarehouseRepo = new WarehouseRepo();
    private productRepo: ProductRepo = new ProductRepo();
    private unitRepo: UnitRepo = new UnitRepo();

    private constructor() {
        super(new InventoryRepo());
    }

    public static getInstance(): InventoryService {
        if (!this.instance) {
            this.instance = new InventoryService();
        }
        return this.instance;
    }

    public async create(request: Partial<IInventory>, tx?: Prisma.TransactionClient): Promise<IIdResponse> {
        let inventoryId: number = 0;

        await this.isExist({ code: request.code });

        await this.validateForeignKeys(
            request,
            {
                customer_id: this.partnerRepo,
                supplier_id: this.partnerRepo,
                delivery_id: this.partnerRepo,
                employee_id: this.employeeRepo,
                organization_id: this.organizationRepo,
                order_id: this.orderRepo
            },
            tx,
        );

        const runTransaction = async (transaction: Prisma.TransactionClient) => {
            const { details, ...inventoryData } = request;

            inventoryId = await this.repo.create(inventoryData as Partial<Inventories>, transaction);

            if (details && details.length > 0) {
                await this.validateForeignKeys(details, {
                    product_id: this.productRepo,
                    unit_id: this.unitRepo,
                    warehouse_id: this.warehouseRepo
                }, transaction);

                const mappedDetails = details.map((item) => {
                    const { product_id, unit_id, warehouse_id, ...rest } = item;
                    return {
                        ...rest,
                        product: product_id ? { connect: { id: product_id } } : undefined,
                        unit: unit_id ? { connect: { id: unit_id } } : undefined,
                        warehouse: warehouse_id ? { connect: { id: warehouse_id } } : undefined,
                        inventory: inventoryId ? { connect: { id: inventoryId } } : undefined,
                    };
                });

                const filteredData = this.filterData(mappedDetails, DEFAULT_EXCLUDED_FIELDS, ['details']);

                await this.inventoryDetailRepo.createMany(filteredData, transaction);
            } else {
                throw new APIError({
                    message: `common.status.${StatusCode.BAD_REQUEST}`,
                    status: ErrorCode.BAD_REQUEST,
                    errors: [`details.${ErrorKey.INVALID}`],
                });
            }
        };

        if (tx) {
            await runTransaction(tx);
        } else {
            await this.db.$transaction(async (transaction) => {
                await runTransaction(transaction);
            });
        }

        return { id: inventoryId };
    }

    public async update(id: number, request: Partial<IInventory>): Promise<IIdResponse> {
            await this.findById(id);
    
            await this.isExist({ code: request.code, id }, true);
    
            await this.validateForeignKeys(
                request,
                {
                    customer_id: this.partnerRepo,
                    supplier_id: this.partnerRepo,
                    delivery_id: this.partnerRepo,
                    employee_id: this.employeeRepo,
                    organization_id: this.organizationRepo,
                    order_id: this.orderRepo,
                },
            );
    
            const { delete: deteleItems, update, add, ...body } = request;
    
            // await this.db.$transaction(async (tx) => {
            //     await this.repo.update({ id }, body as Partial<IContract>, tx);
    
            //     const detailItems = [...(request.add || []), ...(request.update || [])];
            //     if (detailItems.length > 0) {
            //         await this.validateForeignKeys(
            //             detailItems,
            //             {
            //                 product_id: this.productRepo,
            //                 unit_id: this.productRepo,
            //             },
            //             tx,
            //         );
            //     }
    
            //     const mappedDetails: IUpdateChildAction = {
            //         add: this.mapDetails(request.add || [], { contract_id: id }),
            //         update: this.mapDetails(request.update || [], { contract_id: id }),
            //         delete: request.delete,
            //     };
    
            //     const filteredData = {
            //         add: this.filterData(mappedDetails.add, DEFAULT_EXCLUDED_FIELDS, ['key']),
            //         update: this.filterData(mappedDetails.update, DEFAULT_EXCLUDED_FIELDS, ['key']),
            //         delete: mappedDetails.delete,
            //     };
    
            //     if (
            //         filteredData.add.length > 0 ||
            //         filteredData.update.length > 0 ||
            //         (filteredData.delete?.length || 0) > 0
            //     ) {
            //         await this.updateChildEntity(filteredData, this.contractDetailRepo, tx);
            //     }
            // });
    
            return { id };
        }
}
