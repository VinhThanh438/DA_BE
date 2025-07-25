import {
    ICreateMesh,
    ICreateMeshDetail,
    IMesh,
    IMeshDetail,
    IUpdateMesh,
    IUpdateMeshDetail,
} from '@common/interfaces/mesh.interface';
import { IIdResponse, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { Prisma, MeshDetail } from '.prisma/client';
import { BaseService } from './base.service';
import logger from '@common/logger';
import { MeshDetailRepo } from '@common/repositories/mesh-detail.repo';

export class MeshDetailService extends BaseService<MeshDetail, Prisma.MeshDetailSelect, Prisma.MeshDetailWhereInput> {
    private static instance: MeshDetailService;
    private readonly PI = Math.PI;
    private readonly STEEL_DENSITY = 7.85; // g/cm³

    private constructor() {
        super(new MeshDetailRepo());
    }

    static getInstance(): MeshDetailService {
        if (!this.instance) {
            this.instance = new MeshDetailService();
        }
        return this.instance;
    }

    async paginate(query: IPaginationInput): Promise<IPaginationResponse> {
        delete query.organizationId;
        delete query.OR;
        return this.repo.paginate(query, true);
    }

    async create(body: ICreateMeshDetail): Promise<IIdResponse> {
        const prepareData = {
            ...body,
            name: this.handleName(body),
        };
        const mapData = this.autoMapConnection([prepareData]);
        const id = await this.repo.create(mapData[0]);
        return { id };
    }

    async update(id: number, body: IUpdateMeshDetail): Promise<IIdResponse> {
        const prepareData = {
            ...body,
            name: this.handleName(body),
        };
        const mapData = this.autoMapConnection([prepareData]);
        await this.repo.update({ id }, mapData[0]);
        return { id };
    }

    async createMany(data?: ICreateMesh[], tx?: Prisma.TransactionClient) {
        if (!data || data.length === 0) return;

        await this.repo.createMany(data, tx);
        logger.info(`Created ${data.length} product details successfully.`);
    }

    async updateMany(data?: IUpdateMesh[], tx?: Prisma.TransactionClient) {
        if (!data || data.length === 0) return;

        for (const item of data) {
            await this.repo.update({ id: item.id }, item, tx);
        }
        logger.info(`Updated ${data.length} product details successfully.`);
    }

    async deleteMany(ids: number[], tx?: Prisma.TransactionClient): Promise<void> {
        if (!ids || ids.length === 0) return;

        await this.repo.deleteMany({ id: { in: ids } }, tx, false);
        logger.info(`Deleted ${ids.length} product details successfully.`);
    }

    async findAll(query: Prisma.MeshDetailWhereInput, tx?: Prisma.TransactionClient) {
        const data = (await this.repo.findMany(query, false, tx)) as IMeshDetail[];
        return data;
    }

    handleName(data: ICreateMeshDetail): string {
        const baseName = 'Lưới thép hàn: ';
        const specification = `D${data.length_phi}x${data.width_phi}a${data.length_spacing}x${data.width_spacing}`;
        return baseName + specification;
    }

    /**
     * Gộp các tấm lưới thép hàn có cùng tên và cộng dồn số lượng, khối lượng, diện tích
     */
    mergeMeshData(meshes: IMeshDetail[]): IMeshDetail[] {
        const meshMap: Record<
            string,
            IMeshDetail & { total_quantity: number; total_weight: number; total_area: number }
        > = {};

        for (const mesh of meshes) {
            const key = mesh.name;
            const qty = mesh.quantity || 0;
            const weight = this.calculateWeightSheet(mesh);
            const area = this.calculateAreaSheet(mesh.length, mesh.width);

            if (meshMap[key]) {
                meshMap[key].total_quantity += qty;
                meshMap[key].total_weight += weight;
                meshMap[key].total_area += area;
            } else {
                meshMap[key] = {
                    ...mesh,
                    total_quantity: qty,
                    total_weight: weight,
                    total_area: area,
                };
            }
        }

        return Object.values(meshMap);
    }

    /**
     * Tính khối lượng phi trên 1 mét chiều dài / rộng của tấm lưới thép hàn
     */
    calculateWeightPhiMeter(w: number): number {
        const l = (Math.pow(w / 2, 2) * this.PI * this.STEEL_DENSITY) / 1000;
        return parseFloat(l.toFixed(2));
    }

    /**
     * Tính số thanh của chiều dài / rộng tấm lưới thép hàn
     */
    calculateBarPlate(w: number, spacing: number, left: number, rightL: number, inverseSpacing: number): number {
        if (spacing === 0) return 0;
        const bars = (w - left - rightL) / inverseSpacing + 1;
        return Math.max(0, bars);
    }

    /**
     * Tính khối lượng 1 tấm lưới thép hàn
     */
    calculateWeightSheet(data: IMeshDetail): number {
        const { length, width, length_spacing, length_left, length_right, width_spacing, width_left, width_right } =
            data;
        const barPlateLength = this.calculateBarPlate(length, length_spacing, length_left, length_right, width_spacing);
        const barPlateWidth = this.calculateBarPlate(width, width_spacing, width_left, width_right, length_spacing);
        const weightPhiMeterLength = this.calculateWeightPhiMeter(data.length_phi);
        const weightPhiMeterWidth = this.calculateWeightPhiMeter(data.width_phi);
        const totalWeight =
            (length * barPlateLength * weightPhiMeterLength) / 1000 +
            (width * barPlateWidth * weightPhiMeterWidth) / 1000;

        return parseFloat(totalWeight.toFixed(3));
    }

    /**
     * Tính tổng khối lượng của tất cả các tấm lưới thép hàn
     */
    calculateTotalWeight(data: IMeshDetail[]): number {
        const total = data.reduce((total, item) => {
            const itemWeight = item.quantity * this.calculateWeightSheet(item);
            return total + itemWeight;
        }, 0);
        return parseFloat(total.toFixed(3));
    }

    /**
     * Tính diện tích 1 tấm lưới thép hàn
     */
    calculateAreaSheet(length: number, width: number): number {
        const s = (length * width) / 1000000;
        return parseFloat(s.toFixed(2));
    }

    /**
     * Tính tổng diện tích của tất cả các tấm lưới thép hàn
     */
    calculateTotalArea(data: IMeshDetail[]): number {
        const total = data.reduce((total, item) => {
            const s = this.calculateAreaSheet(item.length, item.width);
            return total + s;
        }, 0);
        return parseFloat(total.toFixed(3));
    }
}
