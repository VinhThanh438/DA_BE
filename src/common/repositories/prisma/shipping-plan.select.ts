import { Prisma } from '.prisma/client';
import { PartnerSelection } from './partner.select';
import { OrderSelection } from './order.select';

export const ShippingPlanSelection: Prisma.ShippingPlansSelect = {
    id: true,
    price: true,
    quantity: true,
    status: true,
    rejected_reason: true,
    note: true,
    partner_id: true,
    order_id: true,
    created_at: true,
    updated_at: true,
};

export const ShippingPlanSelectionAll: Prisma.ShippingPlansSelect = {
    ...ShippingPlanSelection,
    partner: {
        select: PartnerSelection,
    },
    order: {
        select: OrderSelection,
    },
};
