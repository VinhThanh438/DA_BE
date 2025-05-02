import { TransactionWarehouses } from '.prisma/client';

export function calcInventoryCurrent(exports: TransactionWarehouses[]) {
    let totalIn = 0;
    let totalOut = 0;
    for (const tx of exports) {
        if (tx.type === 'in') {
            totalIn += tx.quantity ?? 0;
        } else if (tx.type === 'out') {
            totalOut += tx.quantity ?? 0;
        }
    }
    return totalIn - totalOut;
}
