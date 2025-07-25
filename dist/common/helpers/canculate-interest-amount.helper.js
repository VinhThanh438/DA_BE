"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateInterestAmount = calculateInterestAmount;
function calculateInterestAmount(debt, interestRate, days) {
    return (debt * (interestRate / 100) * days) / 365;
}
