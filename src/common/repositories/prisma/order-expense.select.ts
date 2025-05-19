import { Prisma } from '.prisma/client';

export const OrderExpenseSelection: Prisma.OrderExpensesSelect = {
    id: true,
    code: true,
    time_at: true,
    description: true,
    payment_method: true,
    amount: true,
    transaction_person: true,
    address: true,
    attached_documents: true,
    type: true,
    files: true,
};

export const OrderExpenseSelectionAll: Prisma.OrderExpensesSelect = {
    ...OrderExpenseSelection,
};
