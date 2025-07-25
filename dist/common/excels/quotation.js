"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataFakeQuotation = exports.importQuotationCustomizeFooter = exports.importQuotationCustomizeHeader = exports.importQuotationHeader = void 0;
const excel_interface_1 = require("../interfaces/excel.interface");
const words = ['Số:', '010325', 'ĐA/', 'DA'];
// Tạo mảng richText với màu sắc khác nhau cho mỗi từ
const richText = words.map((word, index) => {
    // Mảng màu sắc (hex code)
    const colors = ['000000', 'FC0303', '000000', 'FC0303'];
    return {
        text: word + ' ', // Thêm khoảng trắng sau mỗi từ
        font: {
            color: { argb: colors[index % colors.length] }, // Lặp lại màu nếu vượt quá số lượng màu
        },
    };
});
exports.importQuotationHeader = [
    {
        header: 'Stt',
        key: 'id',
        width: 7,
        formula: 'IF(OR(B{i}<>"",C{i}<>"",D{i}<>"",E{i}<>""),ROW()-ROW($A$1),"")',
        style: excel_interface_1.ListStyle.WHITE,
        children: [],
    },
    {
        header: 'Tên hàng và quy cách',
        key: 'product',
        width: 20,
        dataValidation: {},
        style: excel_interface_1.ListStyle.WHITE,
        children: [],
    },
    {
        header: 'Đvt',
        key: 'unit',
        width: 15,
        dataValidation: {},
        style: excel_interface_1.ListStyle.WHITE,
        children: [],
    },
    {
        header: 'Số lượng',
        key: 'quantity',
        width: 15,
        dataValidation: {},
        style: excel_interface_1.ListStyle.WHITE,
    },
    {
        header: 'Đơn giá',
        key: 'price',
        width: 20,
        dataValidation: {},
        style: excel_interface_1.ListStyle.WHITE,
        children: [
            {
                header: 'Vnđ',
                key: 'price',
                width: 20,
                style: excel_interface_1.ListStyle.YELLOW,
                children: [],
            },
        ],
    },
    {
        header: 'Thành tiền',
        key: 'intoMoney',
        width: 20,
        dataValidation: {},
        style: excel_interface_1.ListStyle.WHITE,
        children: [
            {
                header: 'Vnđ',
                key: 'intoMoney',
                width: 20,
                style: excel_interface_1.ListStyle.YELLOW,
                children: [],
            },
        ],
    },
    {
        header: 'VAT',
        key: 'vat',
        width: 40,
        dataValidation: {},
        style: excel_interface_1.ListStyle.WHITE,
        children: [
            {
                header: '%',
                key: 'vat',
                width: 20,
                style: excel_interface_1.ListStyle.YELLOW,
                children: [],
            },
            {
                header: 'Vnđ',
                key: 'value',
                width: 20,
                style: excel_interface_1.ListStyle.YELLOW,
                children: [],
            },
        ],
    },
    {
        header: 'Tổng tiền',
        key: 'total',
        width: 20,
        dataValidation: {},
        style: excel_interface_1.ListStyle.WHITE,
        children: [
            {
                header: 'Vnđ',
                key: 'total',
                width: 20,
                style: excel_interface_1.ListStyle.YELLOW,
                children: [],
            },
        ],
    },
];
exports.importQuotationCustomizeHeader = [
    {
        key: 'company_name',
        cell: 'C1',
        value: 'CÔNG TY TNHH SX TM THÉP ĐÔNG ANH',
        colSpan: 6,
        style: {
            font: { bold: true, size: 16 },
            alignment: { vertical: 'middle', horizontal: 'left' },
        },
    },
    {
        key: 'address',
        cell: 'C2',
        colSpan: 3,
        value: 'Địa chỉ: Số 27, tổ 28, thị trấn Đông Anh, Hà Nội',
        dataValidation: {},
        style: {
            font: { bold: false, size: 14 },
            alignment: { vertical: 'middle', horizontal: 'left' },
            fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF' },
            },
        },
    },
    {
        key: 'phone',
        cell: 'C3',
        colSpan: 3,
        value: 'Điện thoại: 024.39686769 – Hotline: 0978.993.999',
        dataValidation: {},
        style: {
            font: { bold: false, size: 12 },
            alignment: { vertical: 'middle', horizontal: 'left' },
        },
    },
    {
        key: 'mst',
        cell: 'C4',
        colSpan: 1,
        value: 'MST: 0102378256',
        dataValidation: {},
        style: {
            font: { bold: false, size: 12 },
            alignment: { vertical: 'middle', horizontal: 'left' },
        },
    },
    {
        key: 'iso',
        cell: 'A5',
        colSpan: 1,
        value: 'ISO 9001:2015',
        dataValidation: {},
        style: {
            font: { bold: true, size: 12 },
            alignment: { vertical: 'middle', horizontal: 'center' },
        },
    },
    {
        key: 'no',
        cell: 'A6',
        colSpan: 1,
        value: { richText },
        dataValidation: {},
        style: {
            font: { bold: false, size: 12 },
            alignment: { vertical: 'middle', horizontal: 'center' },
        },
    },
    {
        key: 'date',
        cell: 'H6',
        colSpan: 1,
        value: 'Ngày 28 tháng 03 năm 2025',
        dataValidation: {},
        style: {
            font: { bold: false, size: 12 },
            alignment: { vertical: 'middle', horizontal: 'center' },
        },
    },
    {
        key: 'title',
        cell: 'A7',
        colSpan: 8,
        value: 'BÁO GIÁ',
        dataValidation: {},
        style: {
            font: { bold: true, size: 32 },
            alignment: { vertical: 'middle', horizontal: 'center' },
            fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF' },
            },
        },
    },
    {
        key: 'customer',
        cell: 'B8',
        colSpan: 0,
        value: 'Tên khách hàng',
        dataValidation: {},
        style: {
            font: { bold: true, size: 14, underline: true },
            alignment: { vertical: 'middle', horizontal: 'left' },
            fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF' },
            },
        },
    },
    {
        key: ':',
        cell: 'C8',
        colSpan: 0,
        value: ':',
        dataValidation: {},
        style: {
            font: { bold: false, size: 14 },
            alignment: { vertical: 'middle', horizontal: 'left' },
            fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF' },
            },
        },
    },
    {
        key: ':',
        cell: 'C9',
        colSpan: 0,
        value: ':',
        dataValidation: {},
        style: {
            font: { bold: false, size: 14 },
            alignment: { vertical: 'middle', horizontal: 'left' },
            fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF' },
            },
        },
    },
    {
        key: ':',
        cell: 'C10',
        colSpan: 0,
        value: ':',
        dataValidation: {},
        style: {
            font: { bold: false, size: 14 },
            alignment: { vertical: 'middle', horizontal: 'left' },
            fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF' },
            },
        },
    },
    {
        key: 'customer_name',
        cell: 'D8',
        colSpan: 5,
        value: 'CÔNG TY TNHH TM VÀ XD DONGA					',
        dataValidation: {},
        style: {
            font: { bold: true, size: 14 },
            alignment: { vertical: 'middle', horizontal: 'left' },
            fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF' },
            },
        },
    },
    {
        key: 'b_address',
        cell: 'B9',
        colSpan: 0,
        value: 'Địa chỉ',
        dataValidation: {},
        style: {
            font: { bold: false, size: 14 },
            alignment: { vertical: 'middle', horizontal: 'left' },
            fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF' },
            },
        },
    },
    {
        key: 'b_addressVal',
        cell: 'D9',
        colSpan: 5,
        value: 'Gia lâm - Hà Nội - Việt Nam',
        dataValidation: {},
        style: {
            font: { bold: false, size: 14 },
            alignment: { vertical: 'middle', horizontal: 'left' },
            fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF' },
            },
        },
    },
    {
        key: 'represent',
        cell: 'B10',
        colSpan: 0,
        value: 'Đại diện',
        dataValidation: {},
        style: {
            font: { bold: false, size: 14 },
            alignment: { vertical: 'middle', horizontal: 'left' },
            fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF' },
            },
        },
    },
    {
        key: 'represent_name',
        cell: 'D10',
        colSpan: 0,
        value: 'Anh Trần Văn A',
        dataValidation: {},
        style: {
            font: { bold: false, size: 14 },
            alignment: { vertical: 'middle', horizontal: 'left' },
            fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF' },
            },
        },
    },
    {
        key: 'represent_phone',
        cell: 'F10',
        colSpan: 0,
        value: 'ĐT: 09…..00000',
        dataValidation: {},
        style: {
            font: { bold: false, size: 14 },
            alignment: { vertical: 'middle', horizontal: 'left' },
            fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF' },
            },
        },
    },
    {
        key: 'represent_email',
        cell: 'H10',
        colSpan: 0,
        value: 'Email: tran@gmail.com',
        dataValidation: {},
        style: {
            font: { bold: false, size: 14 },
            alignment: { vertical: 'middle', horizontal: 'left' },
            fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF' },
            },
        },
    },
    {
        key: 'note',
        cell: 'B11',
        colSpan: 0,
        value: 'Theo nhu cầu của Quý khách hàng, Công ty TNHH SX TM Thép Đông Anh xin được báo giá như sau:',
        dataValidation: {},
        style: {
            font: { bold: false, size: 14, italic: true },
            alignment: { vertical: 'middle', horizontal: 'left' },
            fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF' },
            },
        },
    },
];
exports.importQuotationCustomizeFooter = [
    {
        key: 'f_unit',
        cell: '1',
        colSpan: 0,
        value: 'Tong',
        dataValidation: {},
        style: {
            font: { bold: false, size: 14, italic: true },
            alignment: { vertical: 'middle', horizontal: 'left' },
            fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF' },
            },
        },
    },
    // {
    //     key: 'f_text',
    //     cell: 'A25',
    //     colSpan: 0,
    //     value: 'Bằng chữ',
    //     dataValidation: {} as DataValidation,
    //     style: {
    //         font: { bold: false, size: 14, italic: true },
    //         alignment: { vertical: 'middle', horizontal: 'left' },
    //         fill: {
    //             type: 'pattern',
    //             pattern: 'solid',
    //             fgColor: { argb: 'FFFFFF' },
    //         },
    //     },
    // },
];
exports.dataFakeQuotation = [
    {
        id: 1,
        product: 'Thép ABC',
        unit: 'Kg',
        quantity: 100,
        price: 2000000,
        intoMoney: 200000000,
        vat: '10%',
        value: 20000000,
        total: 200000000 - 20000000,
    },
    {
        id: 2,
        product: 'Thép ABC',
        unit: 'Kg',
        quantity: 100,
        price: 2000000,
        intoMoney: 200000000,
        vat: '10%',
        value: 20000000,
        total: 200000000 - 20000000,
    },
    {
        id: 3,
        product: 'Thép ABC',
        unit: 'Kg',
        quantity: 100,
        price: 2000000,
        intoMoney: 200000000,
        vat: '10%',
        value: 20000000,
        total: 200000000 - 20000000,
    },
];
