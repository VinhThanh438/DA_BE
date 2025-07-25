import { APIError } from '@common/error/api.error';
import { ErrorCode } from '@common/errors';
import { IExtraUnits, IProduct, IUnit } from '@common/interfaces/product.interface';
import { ICreateTransactionWarehouse } from '@common/interfaces/transaction-warehouse.interface';
import { TransactionWarehouseType } from '@config/app.constant';

export function calculateConvertQty(detail: any) {
    // return orderDetails.reduce((total, detail) => {
    const { quantity, unit, product } = detail as any;
    if (!product?.unit || !unit || !quantity) return 0;

    if (unit.id === product.unit.id) return quantity;

    const extraUnit = (product.extra_units || []).find((eu: any) => eu.unit?.id === unit.id);
    const convertedQty = extraUnit?.conversion_rate ? quantity * extraUnit.conversion_rate : quantity;

    return convertedQty;
    // }, 0);
}

export function getConversionRate(product?: IProduct, unit?: IUnit): number {
    if (!product?.unit || !unit) return 1;

    if (unit.id === product.unit.id) return 1;

    const extraUnit = (product.extra_units || []).find((eu: any) => eu.unit?.id === unit.id);
    return extraUnit?.conversion_rate || 1;
}

// TODO: FIFO
export function calculateFIFOExportValue(
    product: IProduct,
    quantity: number, // real quantity
): any {
    if (!product.stock_trackings || product.stock_trackings.length === 0) {
        console.log('sortedStockTrackings', product.stock_trackings);
        throw new Error('Sản phẩm không có tồn kho để xuất');
    }

    const unit = product.unit;

    // 2. Quy đổi quantity sang đơn vị chính
    const quantityInMainUnit = quantity * getConversionRate(product, unit);

    let remainingQuantity = quantityInMainUnit;
    let totalValue = 0;

    // 3. Sắp xếp tồn kho từ cũ đến mới
    const sortedStockTrackings = [...product.stock_trackings].sort(
        (a, b) => new Date(a.time_at).getTime() - new Date(b.time_at).getTime(),
    );

    const transactionWarehouses: Partial<ICreateTransactionWarehouse>[] = [];
    const stockTrackingUpdates: any[] = [];
    const stockTrackingsToDelete: number[] = [];

    for (const stockTracking of sortedStockTrackings) {
        if (remainingQuantity <= 0) break;

        const availableQty = stockTracking.current_balance;
        if (availableQty <= 0) continue;

        const usedQty = Math.min(availableQty, remainingQuantity);
        const newBalance = availableQty - usedQty;

        const exportValue = usedQty * stockTracking.price;
        totalValue += exportValue;

        transactionWarehouses.push({
            // organization_id: product.organization_id,
            quantity: usedQty,
            real_quantity: quantity,
            convert_quantity: usedQty,
            product_id: product.id,
            child_id: product.parent_id ? product.id : undefined,
            type: TransactionWarehouseType.OUT,
            price: stockTracking.price,
        });

        // xóa stock tracking
        if (newBalance <= 0) {
            stockTrackingsToDelete.push(stockTracking.id);
        } else {
            // Cập nhật balance mới
            stockTrackingUpdates.push({
                id: stockTracking.id,
                current_balance: newBalance,
            });
        }

        remainingQuantity -= usedQty;
    }

    if (remainingQuantity > 0) {
        throw new APIError({
            message: 'Không đủ tồn kho để xuất',
            status: ErrorCode.BAD_REQUEST,
            errors: [`quantity.exceeded`],
        });
    }

    return {
        money: totalValue,
        transactionWarehouses,
        stockTrackingUpdates,
        stockTrackingsToDelete,
    };
}
