"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListStyle = exports.ListAlignment = exports.ListFill = exports.ListBorder = void 0;
exports.ListBorder = {
    THIN: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
    },
};
exports.ListFill = {
    SOLID: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9D9D9' },
    },
    YELLOW: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFF00' },
    },
    BLUE: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '7FC0FD' },
    },
    BROWN: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'A52A2A' },
    },
    PINK: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFC0CB' },
    },
    WHITE: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF' },
    },
    GREEN: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '90EE90' },
    },
};
exports.ListAlignment = {
    LEFT: {
        vertical: 'middle',
        horizontal: 'left',
        // wrapText: true,
    },
    CENTER: {
        vertical: 'middle',
        horizontal: 'center',
        // wrapText: true,
    },
    RIGHT: {
        vertical: 'middle',
        horizontal: 'right',
        // wrapText: true,
    },
};
exports.ListStyle = {
    SOLID: {
        font: { name: 'Times New Roman', bold: true, size: 14 },
        alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
        border: exports.ListBorder.THIN,
        fill: exports.ListFill.SOLID,
        numFmt: '0',
        protection: { locked: false },
    },
    YELLOW: {
        font: { name: 'Times New Roman', bold: true, size: 14 },
        alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
        border: exports.ListBorder.THIN,
        fill: exports.ListFill.YELLOW,
        numFmt: '0',
        protection: { locked: false },
    },
    BLUE: {
        font: { name: 'Times New Roman', bold: true, size: 14 },
        alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
        border: exports.ListBorder.THIN,
        fill: exports.ListFill.BLUE,
        numFmt: '0',
        protection: { locked: false },
    },
    BROWN: {
        font: { bold: true, size: 14 },
        alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
        border: exports.ListBorder.THIN,
        fill: exports.ListFill.BROWN,
        numFmt: '0',
        protection: { locked: false },
    },
    PINK: {
        font: { name: 'Times New Roman', bold: true, size: 14 },
        alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
        border: exports.ListBorder.THIN,
        fill: exports.ListFill.PINK,
        numFmt: '0',
        protection: { locked: false },
    },
    WHITE: {
        font: { name: 'Times New Roman', bold: true, size: 14 },
        alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
        border: exports.ListBorder.THIN,
        fill: exports.ListFill.WHITE,
        numFmt: '0',
        protection: { locked: false },
    },
    GREEN: {
        font: { bold: true, size: 14 },
        alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
        border: exports.ListBorder.THIN,
        fill: exports.ListFill.GREEN,
        numFmt: '0',
        protection: { locked: false },
    },
};
