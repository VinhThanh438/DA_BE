"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapNestedInput = mapNestedInput;
exports.mapUpdateRelation = mapUpdateRelation;
function mapNestedInput(input) {
    if (!input)
        return undefined;
    if (Array.isArray(input)) {
        return { create: input.map((item) => (Object.assign({}, item))) };
    }
    return { create: Object.assign({}, input) };
}
function mapUpdateRelation(data) {
    if (!data)
        return undefined;
    if (data.length === 1) {
        return { create: data[0] };
    }
    return {
        create: data,
        updateMany: data.map((item) => ({
            where: { id: item.id },
            data: Object.assign({}, item),
        })),
    };
}
