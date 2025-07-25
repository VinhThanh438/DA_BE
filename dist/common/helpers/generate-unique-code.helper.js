"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUniqueCode = generateUniqueCode;
function generateUniqueCode({ lastCode, prefix, maxLength = 6, fillString = '0' }) {
    const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let charPart = '';
    let nextNumber = 1;
    for (let i = 0; i < 2; i++) {
        charPart += char[Math.floor(Math.random() * char.length)];
    }
    if (lastCode && lastCode.startsWith(prefix)) {
        const numberPart = lastCode.replace(prefix, '');
        nextNumber = parseInt(numberPart, 10) + 1;
    }
    return `${prefix}${nextNumber.toString().padStart(maxLength, fillString)}${charPart}`;
}
