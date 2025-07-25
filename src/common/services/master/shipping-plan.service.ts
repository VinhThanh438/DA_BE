import { BaseService } from './base.service';
import { ShippingPlans, Prisma } from '.prisma/client';
import { IIdResponse, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { IShippingPlan } from '@common/interfaces/shipping-plan.interface';
import { OrderRepo } from '@common/repositories/order.repo';
import { PartnerRepo } from '@common/repositories/partner.repo';
import { ShippingPlanRepo } from '@common/repositories/shipping-plan.repo';
import { ShippingPlanStatus } from '@config/app.constant';

export class ShippingPlanService extends BaseService<
    ShippingPlans,
    Prisma.ShippingPlansSelect,
    Prisma.ShippingPlansWhereInput
> {
    private static instance: ShippingPlanService;
    private partnerRepo: PartnerRepo = new PartnerRepo();
    private orderRepo: OrderRepo = new OrderRepo();

    private constructor() {
        super(new ShippingPlanRepo());
    }

    public static getInstance(): ShippingPlanService {
        if (!this.instance) {
            this.instance = new ShippingPlanService();
        }
        return this.instance;
    }

    public async paginate(query: IPaginationInput): Promise<IPaginationResponse> {
        const { isDone, ...otherQuery } = query;
        const where: any = { ...otherQuery };

        if (isDone) {
            where.is_done = isDone;
            where.status = ShippingPlanStatus.CONFIRMED;
            where.vat = { not: 0 };
        }

        const data = await this.repo.paginate(where, true);
        return data;
    }

    public async createShippingPlan(request: Partial<IShippingPlan>): Promise<IIdResponse> {
        await this.validateForeignKeys(request, {
            partner_id: this.partnerRepo,
            order_id: this.orderRepo,
        });
        const createdId = await this.repo.create(request);
        return { id: createdId };
    }

    public async updateShippingPlan(
        id: number,
        request: Partial<IShippingPlan>,
        isAdmin: boolean,
    ): Promise<IIdResponse> {
        await this.canEdit(id, 'shipping-plan', isAdmin);
        await this.validateForeignKeys(request, {
            partner_id: this.partnerRepo,
            order_id: this.orderRepo,
        });
        await this.repo.update({ id }, request);
        return { id };
    }

    public async deleteShippingPlan(id: number, isAdmin: boolean): Promise<IIdResponse> {
        await this.canEdit(id, 'shipping-plan', isAdmin);
        await this.repo.delete({ id });
        return { id };
    }
}
