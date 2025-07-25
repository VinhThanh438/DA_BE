"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcInventoryCurrent = calcInventoryCurrent;
function calcInventoryCurrent(exports) {
    var _a, _b;
    let totalIn = 0;
    let totalOut = 0;
    for (const tx of exports) {
        if (tx.type === 'in') {
            totalIn += (_a = tx.quantity) !== null && _a !== void 0 ? _a : 0;
        }
        else if (tx.type === 'out') {
            totalOut += (_b = tx.quantity) !== null && _b !== void 0 ? _b : 0;
        }
    }
    return totalIn - totalOut;
}
