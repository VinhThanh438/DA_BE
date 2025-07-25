"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateConvertQty = calculateConvertQty;
exports.getConversionRate = getConversionRate;
exports.calculateFIFOExportValue = calculateFIFOExportValue;
const api_error_1 = require("../error/api.error");
const errors_1 = require("../errors");
const app_constant_1 = require("../../config/app.constant");
function calculateConvertQty(detail) {
    // return orderDetails.reduce((total, detail) => {
    const { quantity, unit, product } = detail;
    if (!(product === null || product === void 0 ? void 0 : product.unit) || !unit || !quantity)
        return 0;
    if (unit.id === product.unit.id)
        return quantity;
    const extraUnit = (product.extra_units || []).find((eu) => { var _a; return ((_a = eu.unit) === null || _a === void 0 ? void 0 : _a.id) === unit.id; });
    const convertedQty = (extraUnit === null || extraUnit === void 0 ? void 0 : extraUnit.conversion_rate) ? quantity * extraUnit.conversion_rate : quantity;
    return convertedQty;
    // }, 0);
}
function getConversionRate(product, unit) {
    if (!(product === null || product === void 0 ? void 0 : product.unit) || !unit)
        return 1;
    if (unit.id === product.unit.id)
        return 1;
    const extraUnit = (product.extra_units || []).find((eu) => { var _a; return ((_a = eu.unit) === null || _a === void 0 ? void 0 : _a.id) === unit.id; });
    return (extraUnit === null || extraUnit === void 0 ? void 0 : extraUnit.conversion_rate) || 1;
}
// TODO: FIFO
function calculateFIFOExportValue(product, quantity) {
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
    const sortedStockTrackings = [...product.stock_trackings].sort((a, b) => new Date(a.time_at).getTime() - new Date(b.time_at).getTime());
    const transactionWarehouses = [];
    const stockTrackingUpdates = [];
    const stockTrackingsToDelete = [];
    for (const stockTracking of sortedStockTrackings) {
        if (remainingQuantity <= 0)
            break;
        const availableQty = stockTracking.current_balance;
        if (availableQty <= 0)
            continue;
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
            type: app_constant_1.TransactionWarehouseType.OUT,
            price: stockTracking.price,
        });
        // xóa stock tracking
        if (newBalance <= 0) {
            stockTrackingsToDelete.push(stockTracking.id);
        }
        else {
            // Cập nhật balance mới
            stockTrackingUpdates.push({
                id: stockTracking.id,
                current_balance: newBalance,
            });
        }
        remainingQuantity -= usedQty;
    }
    if (remainingQuantity > 0) {
        throw new api_error_1.APIError({
            message: 'Không đủ tồn kho để xuất',
            status: errors_1.ErrorCode.BAD_REQUEST,
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
