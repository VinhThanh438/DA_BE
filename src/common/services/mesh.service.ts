import { IIdResponse, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { ICreateMesh, IMesh, IMeshDetail, IUpdateMesh } from '@common/interfaces/mesh.interface';
import { ProductRepo } from '@common/repositories/product.repo';
import { MeshRepo } from '@common/repositories/mesh.repo';
import { MeshDetailService } from './master/mesh-detail.service';
import { Prisma, Mesh } from '.prisma/client';
import { BaseService } from './master/base.service';

export class MeshService extends BaseService<Mesh, Prisma.MeshSelect, Prisma.MeshWhereInput> {
    private static instance: MeshService;
    private productRepo: ProductRepo = new ProductRepo();
    private meshDetailService = MeshDetailService.getInstance();

    private constructor() {
        super(new MeshRepo());
    }

    static getInstance(): MeshService {
        if (!this.instance) {
            this.instance = new MeshService();
        }
        return this.instance;
    }

    async paginate(query: IPaginationInput): Promise<IPaginationResponse> {
        delete query.organizationId;
        delete query.OR;

        const data = await this.repo.paginate(query, true);

        data.summary = (await this.summary({})) || {};

        return data;
    }

    async summary(where: Prisma.MeshWhereInput) {
        const sumQty = await this.repo.aggregate(where, {
            _sum: { total_quantity: true, total_weight: true, total_area: true },
        });

        return {
            total_quantity: sumQty._sum?.total_quantity || 0,
            total_weight: sumQty._sum?.total_weight || 0,
            total_area: sumQty._sum?.total_area || 0,
        };
    }

    async create(body: ICreateMesh): Promise<IIdResponse> {
        return await this.db.$transaction(async (tx) => {
            const { details, ...rest } = body;
            const mapData = this.autoMapConnection([rest]);
            const id = await this.repo.create(mapData[0], tx);

            await this.validateForeignKeys(
                details,
                {
                    product_id: this.productRepo,
                },
                tx,
            );

            const detailData = details.map((d) => {
                return { ...d, name: this.meshDetailService.handleName(d), mesh_id: id };
            });
            const mapDetailData = this.autoMapConnection(detailData);
            await this.meshDetailService.createMany(mapDetailData, tx);

            const dataCalculate = await this.calculateTotal(id, detailData, tx);
            await this.updateTotal(id, dataCalculate, tx);

            return { id };
        });
    }

    async update(id: number, body: IUpdateMesh): Promise<IIdResponse> {
        const existingMesh = await this.repo.findOne({ id });
        if (!existingMesh) return { id };

        await this.db.$transaction(async (tx) => {
            const { add, update, delete: deleteIds, ...meshData } = body;

            const mapData = this.autoMapConnection([meshData]);
            await this.repo.update({ id }, mapData[0], tx);

            if (add && add?.length > 0) {
                await this.validateForeignKeys(
                    add,
                    {
                        product_id: this.productRepo,
                    },
                    tx,
                );

                const mapData = this.autoMapConnection(add, { mesh_id: id });
                await this.meshDetailService.createMany(mapData, tx);
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
                await this.meshDetailService.updateMany(mapData, tx);
            }

            if (deleteIds && deleteIds?.length > 0) {
                await this.meshDetailService.deleteMany(deleteIds, tx);
            }

            // calculate total again
            const updatedDetails = await this.meshDetailService.findAll({ mesh_id: id }, tx);
            const dataCalculate = await this.calculateTotal(id, updatedDetails, tx);
            await this.updateTotal(id, dataCalculate, tx);
        });

        return { id };
    }

    async calculateTotal(id: number, data: IMeshDetail[], tx?: Prisma.TransactionClient) {
        const totalQuantity = data.reduce((sum, item) => sum + (item.quantity || 0), 0);
        const totalWeight = this.meshDetailService.calculateTotalWeight(data);
        const totalArea = this.meshDetailService.calculateTotalArea(data);
        return {
            total_quantity: totalQuantity,
            total_weight: totalWeight,
            total_area: totalArea,
        };
    }

    async updateTotal(
        id: number,
        data: { total_quantity: number; total_weight: number; total_area: number },
        tx?: Prisma.TransactionClient,
    ): Promise<void> {
        await this.repo.update({ id }, data, tx);
    }
}
