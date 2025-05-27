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
