"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatPhoneNumber = void 0;
const formatPhoneNumber = (phone) => {
    const digits = phone.replace(/\D/g, '');
    // Chia chuỗi số thành từng nhóm 3 chữ số từ phải sang trái
    const reversed = digits.split('').reverse();
    const grouped = [];
    for (let i = 0; i < reversed.length; i += 3) {
        grouped.push(reversed.slice(i, i + 3).reverse().join(''));
    }
    return grouped.reverse().join('.');
};
exports.formatPhoneNumber = formatPhoneNumber;
