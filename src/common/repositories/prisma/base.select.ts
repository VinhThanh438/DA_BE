import { Prisma } from '.prisma/client';

export const ProductHistorySelection: Prisma.ProductHistoriesSelect = {
    id: true,
    price: true,
    time_at: true,
    product_id: true,
};

export const InvoiceSelection: Prisma.InvoicesSelect = {
    id: true,
    code: true,
    time_at: true,
    invoice_date: true,
    status: true,
    rejected_reason: true,
    note: true,
    files: true,
    is_payment_completed: true,
    type: true,
    order_id: true,
};

export const OrganizationSelection: Prisma.OrganizationsSelect = {
    id: true,
    name: true,
    code: true,
    responsibility: true,
    establishment: true,
    industry: true,
    logo: true,
    type: true,
    files: true,
    address: true,
    phone: true,
    hotline: true,
    email: true,
    website: true,
    tax_code: true,
};

export const OrderSelection: Prisma.OrdersSelect = {
    id: true,
    code: true,
    time_at: true,
    type: true,
    address: true,
    phone: true,
    status: true,
    payment_method: true,
    rejected_reason: true,
    delivery_progress: true,
    files: true,
    note: true,

    product_quality: true,
    delivery_location: true,
    delivery_method: true,
    delivery_time: true,
    payment_note: true,
    additional_note: true,

    partner_id: true,
    employee_id: true,
    organization_id: true,

    organization: {
        select: OrganizationSelection,
    },
    tolerance: true,
};
