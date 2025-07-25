import { ProductionRepo } from '@common/repositories/production.repo';
import { BaseService } from '../master/base.service';
import { Productions, Prisma } from '.prisma/client';
import { IIdResponse } from '@common/interfaces/common.interface';
import {
    ICreateMeshProduction,
    ICreateMeshProductionDetail,
    ICreateProduction,
    ICreateRawMaterial,
    IMeshProductionDetail,
    IProduction,
    IUpdateMeshProduction,
    IUpdateMeshProductionDetail,
    IUpdateRawMaterial,
} from '@common/interfaces/production.interface';
import { EmployeeRepo } from '@common/repositories/employee.repo';
import { PartnerRepo } from '@common/repositories/partner.repo';
import { OrganizationRepo } from '@common/repositories/organization.repo';
import { ProductRepo } from '@common/repositories/product.repo';
import { APIError } from '@common/error/api.error';
import { StatusCode, ErrorCode, ErrorKey } from '@common/errors';
import { ProductionDetailService } from './production-detail.service';
import { OrderRepo } from '@common/repositories/order.repo';
import { CommonDetailRepo } from '@common/repositories/common-detail.repo';
import { RawMaterialService } from './raw-material.service';
import { MeshService } from '../mesh.service';
import { MeshDetailRepo } from '@common/repositories/mesh-detail.repo';
import { IMeshDetail } from '@common/interfaces/mesh.interface';
import { MeshProductionDetailService } from './mesh-production-detail.service';

export class ProductionService extends BaseService<
    Productions,
    Prisma.ProductionsSelect,
    Prisma.ProductionsWhereInput
> {
    private static instance: ProductionService;
    private partnerRepo: PartnerRepo = new PartnerRepo();
    private employeeRepo: EmployeeRepo = new EmployeeRepo();
    private organizationRepo: OrganizationRepo = new OrganizationRepo();
    private productRepo: ProductRepo = new ProductRepo();
    private orderRepo: OrderRepo = new OrderRepo();
    private orderDetailRepo: CommonDetailRepo = new CommonDetailRepo();
    private meshDetailRepo: MeshDetailRepo = new MeshDetailRepo();
    private productionDetailService = ProductionDetailService.getInstance();
    private meshProductionDetailService = MeshProductionDetailService.getInstance();
    private rawMaterialService = RawMaterialService.getInstance();
    private meshService = MeshService.getInstance();

    private constructor() {
        super(new ProductionRepo());
    }

    public static getInstance(): ProductionService {
        if (!this.instance) {
            this.instance = new ProductionService();
        }
        return this.instance;
    }

    async create(body: ICreateProduction, tx?: Prisma.TransactionClient): Promise<IIdResponse> {
        await this.validateForeignKeys(
            body,
            {
                // partner_id: this.partnerRepo,
                // employee_id: this.employeeRepo,
                order_id: this.orderRepo,
                organization_id: this.organizationRepo,
            },
            tx,
        );

        await this.isExist({ code: body.code }, false, tx);

        const { details, raw_materials, ...productionData } = body;

        if (!details || details.length === 0) {
            throw new APIError({
                message: `common.status.${StatusCode.BAD_REQUEST}`,
                status: ErrorCode.BAD_REQUEST,
                errors: [`details.${ErrorKey.INVALID}`],
            });
        }

        await this.validateForeignKeys(
            details,
            {
                order_detail_id: this.orderDetailRepo,
            },
            tx,
        );

        const runTransaction = async (tx: Prisma.TransactionClient) => {
            const mapData = this.autoMapConnection([productionData]);

            const productionId = await this.repo.create(mapData[0], tx);

            const mapDetailData = this.autoMapConnection(details, { production_id: productionId });

            await this.productionDetailService.createMany(mapDetailData, tx);

            return { id: productionId };
        };

        return tx ? runTransaction(tx) : this.db.$transaction(runTransaction);
    }

    async updateProduction(
        id: number,
        body: Partial<IProduction>,
        tx?: Prisma.TransactionClient,
    ): Promise<IIdResponse> {
        await this.findById(id);

        await this.validateForeignKeys(
            body,
            {
                partner_id: this.partnerRepo,
                employee_id: this.employeeRepo,
                order_id: this.orderRepo,
                organization_id: this.organizationRepo,
            },
            tx,
        );

        await this.isExist({ code: body.code }, false, tx);

        const { details, ...productionData } = body;

        if (!details || details.length === 0) {
            throw new APIError({
                message: `common.status.${StatusCode.BAD_REQUEST}`,
                status: ErrorCode.BAD_REQUEST,
                errors: [`details.${ErrorKey.INVALID}`],
            });
        }

        await this.validateForeignKeys(
            details,
            {
                order_detail_id: this.orderDetailRepo,
            },
            tx,
        );

        const runTransaction = async (tx: Prisma.TransactionClient) => {
            const mapData = this.autoMapConnection([productionData]);

            const productionId = await this.repo.update({ id }, mapData[0], tx);

            const mapDetailData = this.autoMapConnection(details, { production_id: productionId });

            await this.productionDetailService.createMany(mapDetailData, tx);

            return { id: productionId };
        };

        return tx ? runTransaction(tx) : this.db.$transaction(runTransaction);
    }

    /**
     * Tạo mới lệnh sản xuất lưới thép hàn
     */
    async createMeshProduction(body: ICreateMeshProduction, tx?: Prisma.TransactionClient): Promise<IIdResponse> {
        await this.validateForeignKeys(
            body,
            {
                organization_id: this.organizationRepo,
                order_od: this.orderRepo,
            },
            tx,
        );

        const { mesh_production_details, raw_materials, type, ...productionData } = body;

        const runTransaction = async (tx: Prisma.TransactionClient) => {
            const mapData = this.autoMapConnection([productionData]);
            const id = await this.repo.create(mapData[0], tx);

            const mapDetailData = this.autoMapConnection(mesh_production_details, { mesh_production_id: id });
            await this.meshProductionDetailService.createMany(mapDetailData, tx);

            const mapRawMaterialData = this.autoMapConnection(raw_materials || [], { mesh_production_id: id });
            await this.rawMaterialService.createMany(mapRawMaterialData, tx);

            // Tính toán tổng số lượng, trọng lượng, diện tích (new)
            await this.calculateAndUpdateTotal(mesh_production_details as IMeshProductionDetail[], id, tx);

            return { id };
        };

        return tx ? runTransaction(tx) : await this.db.$transaction(runTransaction);
    }

    /**
     * Cập nhật lệnh sản xuất lưới thép hàn
     */
    async updateMeshProduction(
        id: number,
        body: IUpdateMeshProduction,
        tx?: Prisma.TransactionClient,
    ): Promise<IIdResponse> {
        const existingMeshProduction = await this.repo.findOne({ id });
        if (!existingMeshProduction) return { id };

        const runTransaction = async (tx: Prisma.TransactionClient) => {
            const {
                type,
                add,
                update,
                delete: deleteIds,
                raw_materials_add,
                raw_materials_update,
                raw_materials_delete,
                ...meshData
            } = body;

            const mapData = this.autoMapConnection([meshData]);
            await this.repo.update({ id }, mapData[0], tx);

            await this.handleDetails(add, update, deleteIds, id, tx);
            await this.handleRawMaterial(raw_materials_add, raw_materials_update, raw_materials_delete, id, tx);

            // Tính toán tổng số lượng, trọng lượng, diện tích (new)
            const meshProductionData = await this.repo.findFirst({ id }, true, tx);
            const meshProductionDetailData = (meshProductionData as IProduction)?.mesh_production_details;
            await this.calculateAndUpdateTotal(meshProductionDetailData, id, tx);
        };

        if (tx) {
            await runTransaction(tx);
        } else {
            await this.db.$transaction(runTransaction);
        }

        return { id };
    }

    /**
     * Cập nhật lệnh sản xuất lưới thép hàn
     */
    private async handleDetails(
        add: ICreateMeshProductionDetail[] | undefined,
        update: IUpdateMeshProductionDetail[] | undefined,
        deleteIds: number[] | undefined,
        id: number,
        tx?: Prisma.TransactionClient,
    ) {
        if (add && add?.length > 0) {
            await this.validateForeignKeys(
                add,
                {
                    mesh_detail_id: this.meshDetailRepo,
                },
                tx,
            );

            const mapData = this.autoMapConnection(add, { mesh_id: id });
            await this.meshProductionDetailService.createMany(mapData, tx);
        }

        if (update && update?.length > 0) {
            await this.validateForeignKeys(
                update,
                {
                    mesh_detail_id: this.meshDetailRepo,
                },
                tx,
            );

            const mapData = this.autoMapConnection(update);
            await this.meshProductionDetailService.updateMany(mapData, tx);
        }

        if (deleteIds && deleteIds?.length > 0) {
            await this.meshProductionDetailService.deleteMany(deleteIds, tx);
        }
    }

    /**
     * Xử lý nguyên liệu thô trong lệnh sản xuất lưới thép hàn
     */
    private async handleRawMaterial(
        add: ICreateRawMaterial[] | undefined,
        update: IUpdateRawMaterial[] | undefined,
        deleteIds: number[] | undefined,
        id: number,
        tx?: Prisma.TransactionClient,
    ) {
        if (add && add?.length > 0) {
            await this.validateForeignKeys(
                add,
                {
                    product_id: this.productRepo,
                },
                tx,
            );

            const mapData = this.autoMapConnection(add, { mesh_id: id });
            await this.rawMaterialService.createMany(mapData, tx);
        }

        if (update && update?.length > 0) {
            await this.validateForeignKeys(
                update,
                {
                    product_id: this.productRepo,
                },
                tx,
            );

            const mapData = this.autoMapConnection(update);
            await this.rawMaterialService.updateMany(mapData, tx);
        }

        if (deleteIds && deleteIds?.length > 0) {
            await this.rawMaterialService.deleteMany(deleteIds, tx);
        }
    }

    private async calculateAndUpdateTotal(data: IMeshProductionDetail[], id: number, tx?: Prisma.TransactionClient) {
        const meshDetail = await this.meshDetailRepo.findMany({
            id: { in: data.map((item) => item.mesh_detail_id) },
        });
        const meshDetailData = meshDetail.map((item) => {
            const detail = data.find((d) => d.mesh_detail_id === item.id);
            return {
                ...item,
                quantity: detail?.quantity || 0,
            };
        }) as IMeshDetail[];
        const dataCalculate = await this.meshService.calculateTotal(id, meshDetailData, tx);
        await this.repo.update({ id }, dataCalculate, tx);
    }
}
