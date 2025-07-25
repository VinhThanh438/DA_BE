"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataFakeBank = exports.importBankCustomizeHeader = exports.importBankHeader = void 0;
const excel_interface_1 = require("../interfaces/excel.interface");
exports.importBankHeader = [
    {
        header: 'Stt',
        key: 'id',
        width: 7,
        formula: 'IF(OR(B{i}<>"",C{i}<>"",D{i}<>"",E{i}<>""),ROW()-ROW($A$1),"")',
        style: excel_interface_1.ListStyle.WHITE,
        children: [],
    },
    {
        header: 'Ngày',
        key: 'date',
        width: 20,
        dataValidation: {},
        style: excel_interface_1.ListStyle.WHITE,
        children: [],
    },
    {
        header: 'Nội dung',
        key: 'content',
        width: 40,
        dataValidation: {},
        style: excel_interface_1.ListStyle.WHITE,
        children: [],
    },
    {
        header: 'Mã khách hàng',
        key: 'code',
        width: 20,
        dataValidation: {},
        style: excel_interface_1.ListStyle.WHITE,
    },
    {
        header: 'Số dư đầu kỳ',
        key: 'beginningBalance',
        width: 20,
        dataValidation: {},
        style: excel_interface_1.ListStyle.WHITE,
        children: [
            {
                header: 'Phát sinh có',
                key: 'arise',
                width: 20,
                style: excel_interface_1.ListStyle.WHITE,
                children: [],
            },
            {
                header: 'Phát sinh nợ',
                key: 'debt',
                width: 20,
                style: excel_interface_1.ListStyle.WHITE,
                children: [],
            },
        ],
    },
    {
        header: '1000000',
        key: 'balance',
        width: 30,
        dataValidation: {},
        style: excel_interface_1.ListStyle.WHITE,
        children: [
            {
                header: 'Số dư',
                key: 'balance',
                width: 20,
                style: excel_interface_1.ListStyle.WHITE,
                children: [],
            },
        ],
    },
];
exports.importBankCustomizeHeader = [
    {
        key: 'company_name',
        cell: 'A1',
        value: 'CÔNG TY TNHH SX TM THÉP ĐÔNG ANH',
        colSpan: 4,
        style: {
            font: { bold: true, size: 14 },
            alignment: { vertical: 'middle', horizontal: 'left' },
        },
    },
    {
        key: 'unit',
        cell: 'A3',
        colSpan: 1,
        value: 'Đvt: VNĐ',
        dataValidation: {},
        style: {
            font: { bold: false, size: 12 },
            alignment: { vertical: 'middle', horizontal: 'left' },
        },
    },
];
exports.dataFakeBank = [
    {
        id: 1,
        date: '12/5/2025',
        content: 'Xuân mai thanh toán tiền thép HĐ SỐ',
        code: 'XM123',
        arise: 350000000,
        debt: '',
        balance: '',
    },
    {
        id: 2,
        date: '12/5/2025',
        content: 'Đông Anh thanh toán tiền cho HĐ So',
        code: 'AB123',
        arise: '',
        debt: 200000000,
        balance: '',
    },
    {
        id: 3,
        date: '12/5/2025',
        content: 'Hòa Phát thanh toán tiền cho HĐ So',
        code: 'HP123',
        arise: 500000000,
        debt: 200000000,
        balance: '',
    },
];
