import { ICreateFacility, IUpdateFacility } from '@common/interfaces/facility.interface';
import { FacilityRepo } from '@common/repositories/facility.repo';
import { UnitRepo } from '@common/repositories/unit.repo';
import { Prisma, Facility } from '.prisma/client';
import { CommonService } from '../common.service';
import { BaseService } from './base.service';
import { PartnerRepo } from '@common/repositories/partner.repo';

export class FacilityService extends BaseService<Facility, Prisma.FacilitySelect, Prisma.FacilityWhereInput> {
    private static instance: FacilityService;
    private unitRepo: UnitRepo = new UnitRepo();
    private partnerRepo: PartnerRepo = new PartnerRepo();

    private constructor() {
        super(new FacilityRepo());
    }

    static getInstance(): FacilityService {
        if (!this.instance) {
            this.instance = new FacilityService();
        }
        return this.instance;
    }

    async create(body: ICreateFacility) {
        const code = await CommonService.getCode('FACILITY');
        const facilityData = { ...body, code };

        // await this.findAndCheckExist(facilityData, ['name']);

        await this.validateForeignKeys(facilityData, {
            unit_id: this.unitRepo,
            partner_id: this.partnerRepo,
        });

        const mapData = this.autoMapConnection([facilityData]);
        const id = await this.repo.create(mapData[0]);
        return { id };
    }

    async update(id: number, body: IUpdateFacility) {
        // if (body.name) await this.findAndCheckExist(body, ['name'], true);

        if (body.unit_id) {
            await this.validateForeignKeys(body, {
                unit_id: this.unitRepo,
                partner_id: this.partnerRepo,
            });
        }

        const mapData = this.autoMapConnection([body]);
        await this.repo.update({ id }, mapData[0]);
        return { id };
    }

    async createMany(data: ICreateFacility[], tx?: Prisma.TransactionClient) {
        const mapData = this.autoMapConnection(data);
        await this.repo.createMany(mapData, tx);
    }
}
