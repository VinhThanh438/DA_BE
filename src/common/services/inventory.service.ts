import {
    Inventories,
    InventoryType,
    PartnerType,
    Prisma,
    PrismaClient,
    TransactionWarehouseType,
} from '.prisma/client';
import { APIError } from '@common/error/api.error';
import { ErrorKey, StatusCode } from '@common/errors';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { IIdResponse, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import {
    InventoryInventoryDetails,
    Inventory,
    IUpdateInventory,
    IUpdateInventories,
} from '@common/interfaces/inventory.interface';
import { InventoryRepo } from '@common/repositories/inventory.repo';
import { ModelPrefixMap, PrefixCode } from '@config/app.constant';
import { generateUniqueCode } from '@common/helpers/generate-unique-code.helper';
import logger from '@common/logger';
import { TransactionWarehouseRepo } from '@common/repositories/transaction-warehouse.repo';
import { TimeHelper } from '@common/helpers/time.helper';
import { calcInventoryCurrent } from '@common/helpers/common.helper';
import { transformDecimal } from '@common/helpers/transform.util';

export class InventoryService {
    private inventoryRepo: InventoryRepo = new InventoryRepo();
    private static instance: InventoryService;
    private db = DatabaseAdapter.getInstance();
    public static getInstance(): InventoryService {
        if (!this.instance) {
            this.instance = new InventoryService();
        }
        return this.instance;
    }
    private validateProduct(productsNotFound: number[], message: string) {
        const formattedErrors: string[] = [];

        for (const item of productsNotFound) {
            formattedErrors.push(`${message}.${item}`);
        }
        if (productsNotFound.length > 0) {
            throw new APIError({
                message: message,
                errors: formattedErrors,
                status: StatusCode.BAD_REQUEST,
            });
        }
    }
    public async getById(id: number): Promise<Partial<Inventories>> {
        const output = await this.inventoryRepo.findOne({ id: id }, true);
        if (!output) {
            throw new APIError({
                message: 'common.not_found',
                status: StatusCode.BAD_REQUEST,
                errors: [`id.${ErrorKey.NOT_FOUND}`],
            });
        }

        return output;
    }
    public async isExist(id: number, type: string, prisma: any): Promise<any> {
        if (type === 'organizations') {
            const check = await prisma.findFirst({
                where: {
                    id: id,
                },
            });
            if (check) {
                return true;
            }
            return false;
        } else if (type === 'employees') {
            const check = await prisma.findFirst({
                where: {
                    id: id,
                },
            });
            if (check) {
                return true;
            }
            return false;
        } else {
            const check = await prisma.findFirst({
                where: {
                    id: id,
                    type: type,
                },
            });

            if (check) {
                return true;
            }
            return false;
        }
    }
    async createInventory(input: Inventory): Promise<IIdResponse> {
        const check_code = await this.inventoryRepo.findOne({
            code: input.code,
        });

        if (check_code) {
            throw new APIError({
                message: 'code.existed',
                status: StatusCode.BAD_REQUEST,
                errors: [`code.${ErrorKey.EXISTED}`],
            });
        }
        const data = await this.db.$transaction(
            async (prisma) => {
                const inventory: Inventory = {
                    code: input.code,
                    type: input.type,
                    license_plate: input.license_plate,
                    employee_id: input.employee_id,
                    delivery_id: input.delivery_id,
                    supplier_id: input.supplier_id,
                    customer_id: input.customer_id,
                    organization_id: input.organization_id,
                    note: input.note,
                };
                const fKeyError: string[] = [];

                const organization = await this.isExist(
                    Number(inventory.organization_id),
                    'organizations',
                    prisma.organizations,
                );
                const employee = await this.isExist(Number(inventory.employee_id), 'employees', prisma.employees);
                if (!employee) {
                    fKeyError.push('employee_id.not_found');
                }
                if (!organization) {
                    fKeyError.push('organization_id.not_found');
                }

                if (
                    input.type === InventoryType.material_in ||
                    input.type === InventoryType.normal_out ||
                    input.type === InventoryType.purchase_in
                ) {
                    const supplier = await this.isExist(
                        Number(inventory.supplier_id),
                        PartnerType.supplier,
                        prisma.partners,
                    );
                    const delivery = await this.isExist(
                        Number(inventory.delivery_id),
                        PartnerType.delivery,
                        prisma.partners,
                    );
                    const customer = await this.isExist(
                        Number(inventory.customer_id),
                        PartnerType.customer,
                        prisma.partners,
                    );
                    if (!delivery) {
                        fKeyError.push('delivery_id.not_found');
                    }
                    if (!supplier) {
                        fKeyError.push('supplier_id.not_found');
                    }
                    if (!customer) {
                        fKeyError.push('customer_id.not_found');
                    }
                }
                if (fKeyError && fKeyError.length > 0) {
                    throw new APIError({
                        message: 'common.not_found',
                        status: StatusCode.BAD_REQUEST,
                        errors: fKeyError,
                    });
                }
                if (input.time_at) {
                    inventory.time_at = TimeHelper.parseDay(input.time_at).toDate();
                }
                if (input.order_id) {
                    inventory.order_id = input.order_id;
                }
                if (input.files) {
                    inventory.files = input.files;
                }
                const data = await prisma.inventories.create({ data: inventory, select: { id: true } });

                if (input.products) {
                    const inventoryData: InventoryInventoryDetails[] = [];
                    for (const product of input.products) {
                        const inventoryDetailPurchase: InventoryInventoryDetails = {
                            product_id: Number(product.product_id),
                            quantity: Number(product.quantity), // gán giá trị mặc định nếu cần
                            price: String(product.price),
                            discount: product.discount ?? 0,
                            note: product.note ?? '',
                            warehouse_id: product.warehouse_id,
                            inventory_id: data.id,
                            key: product.key,
                        };
                        inventoryData.push(inventoryDetailPurchase);
                    }

                    if (
                        input.type === InventoryType.finished_in ||
                        input.type === InventoryType.purchase_in ||
                        input.type === InventoryType.material_in
                    ) {
                        const transactions = [];
                        const inventoryDataCreate: any[] = [];
                        const productsNotFound: number[] = [];
                        for (const item of inventoryData) {
                            const existed = await prisma.products.findFirst({
                                where: {
                                    id: item.product_id,
                                },
                            });
                            if (!existed) {
                                productsNotFound.push(Number(item.key));
                            }
                            transactions.push({
                                type: TransactionWarehouseType.in,
                                warehouse_id: item.warehouse_id,
                                product_id: item.product_id,
                                quantity: item.quantity,
                                inventory_id: item.inventory_id,
                                organization_id: input.organization_id,
                            });
                            inventoryDataCreate.push({
                                product_id: Number(item.product_id),
                                quantity: Number(item.quantity),
                                price: String(item.price),
                                discount: item.discount ?? 0,
                                note: item.note ?? '',
                                warehouse_id: item.warehouse_id,
                                inventory_id: data.id,
                            });
                        }
                        if (productsNotFound.length > 0) {
                            this.validateProduct(productsNotFound, 'product_id.not_found');
                        }
                        await prisma.inventoryDetails.createMany({ data: inventoryDataCreate });

                        await prisma.transactionWarehouses.createMany({ data: transactions });
                        return data;
                    } else if (input.type === InventoryType.material_out || input.type === InventoryType.normal_out) {
                        const transactions = [];
                        const exportFailures = [];
                        const inventoryDataCreate: InventoryInventoryDetails[] = [];
                        const productsNotFound: number[] = [];

                        for (const item of inventoryData) {
                            const existed = await prisma.products.findFirst({
                                where: {
                                    id: item.product_id,
                                },
                            });

                            if (!existed) {
                                productsNotFound.push(Number(item.key));
                            }
                        }

                        if (productsNotFound.length > 0) {
                            this.validateProduct(productsNotFound, 'product_id.not_found');
                        }
                        for (const item of inventoryData) {
                            const exports = await prisma.transactionWarehouses.findMany({
                                where: {
                                    product_id: item.product_id,
                                    warehouse_id: item.warehouse_id,
                                },
                            });
                            const quantityRemaining = calcInventoryCurrent(exports);
                            if (Number(item.quantity) > quantityRemaining) {
                                exportFailures.push({
                                    product_id: item.product_id,
                                    warehouse_id: item.warehouse_id,
                                    warehouse_quantity: quantityRemaining,
                                    export_quantity: item.quantity,
                                    key: item.key,
                                    message: 'Kho không đủ số lượng để xuất đi sản phẩm này',
                                });
                                continue;
                            }
                            transactions.push({
                                type: TransactionWarehouseType.out,
                                warehouse_id: item.warehouse_id,
                                product_id: item.product_id,
                                quantity: item.quantity,
                                inventory_id: item.inventory_id,
                                organization_id: input.organization_id,
                            });
                            inventoryDataCreate.push({
                                product_id: Number(item.product_id),
                                quantity: Number(item.quantity), // gán giá trị mặc định nếu cần
                                price: String(item.price),
                                discount: item.discount ?? 0,
                                note: item.note ?? '',
                                warehouse_id: item.warehouse_id,
                                inventory_id: data.id,
                            });
                        }
                        if (exportFailures.length > 0) {
                            const formattedErrors: string[] = [];

                            for (const item of exportFailures) {
                                formattedErrors.push(`product.exceed.${item.key}`);
                            }
                            throw new APIError({
                                message: `common.${ErrorKey.INVALID}`,
                                errors: formattedErrors,
                                status: StatusCode.BAD_REQUEST,
                            });
                        } else {
                            await prisma.inventoryDetails.createMany({ data: inventoryDataCreate });
                            await prisma.transactionWarehouses.createMany({ data: transactions });
                            return data;
                        }
                    }
                }
            },
            {
                isolationLevel: Prisma.TransactionIsolationLevel.Serializable, // optional, default defined by database configuration
                maxWait: 5000, // default: 2000
                timeout: 10000, // default: 5000
            },
        );

        return { id: Number(data?.id) };
    }
    async deleteInventory(id: number): Promise<IIdResponse> {
        const is_exist = await this.inventoryRepo.findOne({ id: id });
        if (!is_exist) {
            throw new APIError({
                message: 'common.not_found',
                status: StatusCode.BAD_REQUEST,
                errors: [`id.${ErrorKey.NOT_FOUND}`],
            });
        }
        const output = await this.db.$transaction(
            async (prisma) => {
                await prisma.transactionWarehouses.deleteMany({
                    where: {
                        inventory_id: id,
                    },
                });
                return await prisma.inventories.delete({
                    where: {
                        id: id,
                    },
                });
            },
            {
                isolationLevel: Prisma.TransactionIsolationLevel.Serializable, // optional, default defined by database configuration
                maxWait: 5000, // default: 2000
                timeout: 10000, // default: 5000
            },
        );
        return { id: output.id };
    }
    async updateInventory(id: number, input: IUpdateInventory): Promise<IIdResponse> {
        const is_existed = await this.inventoryRepo.findOne({ id: id, type: input.type });
        if (!is_existed) {
            throw new APIError({
                message: 'common.not_found',
                status: StatusCode.BAD_REQUEST,
                errors: [`id.${ErrorKey.NOT_FOUND}`],
            });
        }
        const data = await this.db.$transaction(
            async (prisma) => {
                const updateInventory: IUpdateInventory = {
                    license_plate: input.license_plate,
                    employee_id: input.employee_id,
                    delivery_id: input.delivery_id,
                    supplier_id: input.supplier_id,
                    customer_id: input.customer_id,
                    organization_id: input.organization_id,
                    files: input.files,
                    note: input.note,
                };
                const fKeyError: string[] = [];

                const organization = await this.isExist(
                    Number(updateInventory.organization_id),
                    'organizations',
                    prisma.organizations,
                );
                const employee = await this.isExist(Number(updateInventory.employee_id), 'employees', prisma.employees);
                if (!employee) {
                    fKeyError.push('employee_id.not_found');
                }
                if (!organization) {
                    fKeyError.push('organization_id.not_found');
                }

                if (
                    input.type === InventoryType.material_in ||
                    input.type === InventoryType.normal_out ||
                    input.type === InventoryType.purchase_in
                ) {
                    const supplier = await this.isExist(
                        Number(updateInventory.supplier_id),
                        PartnerType.supplier,
                        prisma.partners,
                    );
                    const delivery = await this.isExist(
                        Number(updateInventory.delivery_id),
                        PartnerType.delivery,
                        prisma.partners,
                    );
                    const customer = await this.isExist(
                        Number(updateInventory.customer_id),
                        PartnerType.customer,
                        prisma.partners,
                    );
                    if (!delivery) {
                        fKeyError.push('delivery_id.not_found');
                    }
                    if (!supplier) {
                        fKeyError.push('supplier_id.not_found');
                    }
                    if (!customer) {
                        fKeyError.push('customer_id.not_found');
                    }
                }
                if (fKeyError && fKeyError.length > 0) {
                    throw new APIError({
                        message: 'common.not_found',
                        status: StatusCode.BAD_REQUEST,
                        errors: fKeyError,
                    });
                }
                if (input.time_at) {
                    updateInventory.time_at = TimeHelper.parseDay(input.time_at).toDate();
                }
                if (input.order_id) {
                    updateInventory.order_id = input.order_id;
                }
                const inventory = await prisma.inventories.update({
                    where: { id: id },
                    data: updateInventory,
                });
                if (input.products) {
                    const transactionAdd = [];
                    const inventoryDataAdd = [];
                    const exportFailures = [];
                    const productsNotFound = [] as number[];

                    if (
                        input.type === InventoryType.finished_in ||
                        input.type === InventoryType.purchase_in ||
                        input.type === InventoryType.material_in
                    ) {
                        for (const item of input.products.add) {
                            const existed = await prisma.products.findFirst({
                                where: {
                                    id: item.product_id,
                                },
                            });
                            if (!existed) {
                                productsNotFound.push(Number(item.key));
                            }
                        }
                        for (const item of input.products.update) {
                            const existed = await prisma.products.findFirst({
                                where: {
                                    id: item.product_id,
                                },
                            });
                            if (!existed) {
                                productsNotFound.push(Number(item.key));
                            }
                        }
                        for (const item of input.products.delete) {
                            const existed = await prisma.products.findFirst({
                                where: {
                                    id: Number(item.product_id),
                                },
                            });
                            if (!existed) {
                                productsNotFound.push(Number(item.key));
                            }
                        }
                        if (productsNotFound.length > 0) {
                            this.validateProduct(productsNotFound, 'product_id.not_found');
                        }
                        for (const add of input.products.add) {
                            transactionAdd.push({
                                type: TransactionWarehouseType.in,
                                warehouse_id: add.warehouse_id,
                                product_id: add.product_id,
                                quantity: add.quantity,
                                inventory_id: add.inventory_id,
                                organization_id: input.organization_id,
                            });
                            inventoryDataAdd.push({
                                product_id: Number(add.product_id),
                                quantity: Number(add.quantity),
                                price: String(add.price),
                                discount: add.discount ?? 0,
                                note: add.note ?? '',
                                warehouse_id: add.warehouse_id,
                                inventory_id: id,
                            });
                        }

                        await prisma.inventoryDetails.createMany({ data: inventoryDataAdd });
                        await prisma.transactionWarehouses.createMany({ data: transactionAdd });
                        for (const update of input.products.update) {
                            for (const update of input.products.update) {
                                const existed = await prisma.products.findFirst({
                                    where: {
                                        id: update.product_id,
                                    },
                                });
                                if (!existed) {
                                    productsNotFound.push(Number(update.key));
                                }
                            }

                            await prisma.transactionWarehouses.updateMany({
                                where: {
                                    product_id: update.product_id,
                                    inventory_id: id,
                                },
                                data: {
                                    type: TransactionWarehouseType.in,
                                    warehouse_id: update.warehouse_id,
                                    product_id: update.product_id,
                                    quantity: update.quantity,
                                    inventory_id: update.inventory_id,
                                    organization_id: input.organization_id,
                                },
                            });
                            await prisma.inventoryDetails.updateMany({
                                where: {
                                    inventory_id: id,
                                    product_id: update.product_id,
                                },
                                data: {
                                    product_id: Number(update.product_id),
                                    quantity: Number(update.quantity),
                                    price: String(update.price),
                                    discount: update.discount ?? 0,
                                    note: update.note ?? '',
                                    warehouse_id: update.warehouse_id,
                                },
                            });
                        }
                        for (const del_id of input.products.delete) {
                            await prisma.transactionWarehouses.deleteMany({
                                where: {
                                    inventory_id: id,
                                    product_id: Number(del_id.product_id),
                                },
                            });
                            await prisma.inventoryDetails.deleteMany({
                                where: {
                                    inventory_id: id,
                                    product_id: Number(del_id.product_id),
                                },
                            });
                        }
                        return inventory;
                    } else if (input.type === InventoryType.material_out || input.type === InventoryType.normal_out) {
                        for (const add of input.products.add) {
                            const exports = await prisma.transactionWarehouses.findMany({
                                where: {
                                    product_id: add.product_id,
                                    warehouse_id: add.warehouse_id,
                                },
                            });

                            const quantityRemaining = calcInventoryCurrent(exports);
                            if (Number(add.quantity) > quantityRemaining) {
                                exportFailures.push({
                                    product_id: add.product_id,
                                    warehouse_id: add.warehouse_id,
                                    warehouse_quantity: quantityRemaining,
                                    export_quantity: add.quantity,
                                    key: add.key,
                                    message: 'Kho không đủ số lượng để xuất đi sản phẩm này',
                                });
                                continue;
                            }

                            transactionAdd.push({
                                type: TransactionWarehouseType.out,
                                warehouse_id: add.warehouse_id,
                                product_id: add.product_id,
                                quantity: add.quantity,
                                inventory_id: add.inventory_id,
                                organization_id: input.organization_id,
                            });
                            inventoryDataAdd.push({
                                product_id: Number(add.product_id),
                                quantity: Number(add.quantity), // gán giá trị mặc định nếu cần
                                price: String(add.price),
                                discount: add.discount ?? 0,
                                note: add.note ?? '',
                                warehouse_id: add.warehouse_id,
                                inventory_id: id,
                            });
                        }
                        if (exportFailures.length === 0) {
                            await prisma.inventoryDetails.createMany({ data: inventoryDataAdd });
                            await prisma.transactionWarehouses.createMany({ data: transactionAdd });
                        }
                        for (const update of input.products.update) {
                            const exports = await prisma.transactionWarehouses.findMany({
                                where: {
                                    product_id: update.product_id,
                                    warehouse_id: update.warehouse_id,
                                },
                            });
                            const current_product = await prisma.inventoryDetails.findFirst({
                                where: {
                                    product_id: update.product_id,
                                    warehouse_id: update.warehouse_id,
                                },
                            });
                            const quantityRemaining = calcInventoryCurrent(exports);
                            if (Number(update.quantity) > quantityRemaining + Number(current_product?.quantity)) {
                                exportFailures.push({
                                    product_id: update.product_id,
                                    warehouse_id: update.warehouse_id,
                                    warehouse_quantity: quantityRemaining + Number(current_product?.quantity),
                                    export_quantity: update.quantity,
                                    key: update.key,
                                    message: 'Kho không đủ số lượng để xuất đi sản phẩm này',
                                });
                                continue;
                            }
                            if (exportFailures.length === 0) {
                                await prisma.transactionWarehouses.updateMany({
                                    where: {
                                        product_id: update.product_id,
                                        inventory_id: id,
                                    },
                                    data: {
                                        type: TransactionWarehouseType.in,
                                        warehouse_id: update.warehouse_id,
                                        product_id: update.product_id,
                                        quantity: update.quantity,
                                        inventory_id: update.inventory_id,
                                        organization_id: input.organization_id,
                                    },
                                });
                                await prisma.inventoryDetails.updateMany({
                                    where: {
                                        inventory_id: id,
                                        product_id: update.product_id,
                                    },
                                    data: {
                                        product_id: Number(update.product_id),
                                        quantity: Number(update.quantity),
                                        price: String(update.price),
                                        discount: update.discount ?? 0,
                                        note: update.note ?? '',
                                        warehouse_id: update.warehouse_id,
                                    },
                                });
                            }
                        }
                        for (const del of input.products.delete) {
                            await prisma.transactionWarehouses.deleteMany({
                                where: {
                                    product_id: Number(del.product_id),
                                    inventory_id: id,
                                },
                            });
                            await prisma.inventoryDetails.deleteMany({
                                where: {
                                    product_id: Number(del.product_id),
                                    inventory_id: id,
                                },
                            });
                        }
                        if (exportFailures.length > 0) {
                            const formattedErrors: string[] = [];

                            for (const item of exportFailures) {
                                formattedErrors.push(`product.exceed.${item.key}`);
                            }
                            throw new APIError({
                                message: `common.${ErrorKey.INVALID}`,
                                errors: formattedErrors,
                                status: StatusCode.BAD_REQUEST,
                            });
                        } else {
                            return inventory;
                        }
                    }
                }
            },
            {
                isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
                maxWait: 5000,
                timeout: 10000,
            },
        );
        return { id: data?.id ?? 0 };
    }
    async getInventory(body: IPaginationInput, type: String): Promise<IPaginationResponse> {
        let output;
        if (!type) {
            output = this.inventoryRepo.paginate(body, true, { type: type });
        }
        output = this.inventoryRepo.paginate(body, true);
        return transformDecimal(output);
    }
}
