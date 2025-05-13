import { Column, DataValidation } from 'exceljs';
import { ICustomizeCell, IHeader, ListStyle } from '../interfaces/excel.interface';

export const importWarehouseHeader: IHeader[] = [
    {
        header: 'Stt',
        key: 'id',
        width: 7,
        formula: 'IF(OR(B{i}<>"",C{i}<>"",D{i}<>"",E{i}<>""),ROW()-ROW($A$1),"")',
        style: ListStyle.WHITE as Partial<Column>,
        children: [],
    },
    {
        header: 'Hàng hóa và quy cách',
        key: 'code',
        width: 30,
        dataValidation: {} as DataValidation,
        style: ListStyle.SOLID as Partial<Column>,
        children: [],
    },
    {
        header: 'Mã hàng',
        key: 'field',
        width: 15,
        dataValidation: {} as DataValidation,
        style: ListStyle.SOLID as Partial<Column>,
        children: [],
    },
    {
        header: 'Đơn vị',
        key: 'name',
        width: 15,
        dataValidation: {} as DataValidation,
        style: ListStyle.YELLOW as Partial<Column>,
        children: [],
    },
    {
        header: 'Đvt',
        key: 'type',
        width: 15,
        dataValidation: {} as DataValidation,
        style: ListStyle.YELLOW as Partial<Column>,
        children: [],
    },
    {
        header: 'Số lượng',
        key: 'group_name',
        width: 30,
        dataValidation: {} as DataValidation,
        style: ListStyle.YELLOW as Partial<Column>,
        children: [
            {
                header: 'Chứng từ',
                key: 'group_name',
                width: 15,
                dataValidation: {} as DataValidation,
                style: ListStyle.YELLOW as Partial<Column>,
                children: [],
            },
            {
                header: 'Thực nhận',
                key: 'group_name',
                width: 15,
                dataValidation: {} as DataValidation,
                style: ListStyle.YELLOW as Partial<Column>,
                children: [],
            },
        ],
    },
    {
        header: 'Đơn giá',
        key: 'position',
        width: 20,
        dataValidation: {} as DataValidation,
        style: ListStyle.SOLID as Partial<Column>,
        children: [],
    },
    {
        header: 'Thành tiền',
        key: 'dob',
        width: 30,
        dataValidation: {} as DataValidation,
        style: ListStyle.SOLID as Partial<Column>,
        children: [],
    },

    {
        header: 'Đưa vào chi phí phát sinh',
        key: 'address',
        width: 45,
        style: ListStyle.SOLID as Partial<Column>,
        children: [
            {
                header: 'Kg chênh lệch',
                key: 'email',
                width: 18,
                style: ListStyle.SOLID as Partial<Column>,
                children: [],
            },
            {
                header: 'Thành tiền chênh lệch',
                key: 'phone_number',
                width: 15,
                style: ListStyle.SOLID as Partial<Column>,
                children: [],
            },
        ],
    },
];

export const importWarehouseCustomizeHeader: ICustomizeCell[] = [
    {
        key: 'company_name',
        cell: 'C1',
        value: 'Công ty TNHH Sản Xuất Và Thương mại Thép Đông Anh',
        colSpan: 6,
        style: {
            font: { bold: true, size: 18 },
            alignment: { vertical: 'middle', horizontal: 'left' },
        },
    },
    {
        key: 'address',
        cell: 'C2',
        value: 'Địa chỉ: Tổ 28 – Thị trấn Đông Anh - Hà Nội',
        colSpan: 6,
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
        key: 'contact',
        cell: 'C3',
        colSpan: 6,
        value: 'Điện thoại:  0243.968.6769 – Hotline: 0978.993.999',
        dataValidation: {} as DataValidation,
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
        key: 'tax_code',
        cell: 'C4',
        value: 'Mã số thuế: 0102378256',
        colSpan: 6,
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
        key: 'account',
        cell: 'C5',
        colSpan: 6,
        value: 'Tài khoản: 2141.0000.378769 – NH Đầu tư và PT Đông Hà Nội',
        dataValidation: {} as DataValidation,
        style: {
            font: { bold: false, size: 14 },
            alignment: { vertical: 'middle', horizontal: 'left' },
            fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF' },
            },
            border: {
                bottom: { style: 'thin' },
            },
        },
    },
    {
        key: 'iso',
        cell: 'A5',
        value: 'ISO 9001:2015',
        colSpan: 1,
        style: {
            font: { bold: true, size: 15 },
            alignment: { vertical: 'middle', horizontal: 'center' },
            fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF' },
            },
            border: {
                bottom: { style: 'thin' },
            },
        },
    },
    {
        key: 'title',
        cell: 'C6',
        colSpan: 5,
        value: 'Phiếu Nhập Kho',
        dataValidation: {} as DataValidation,
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
        key: 'no',
        cell: 'I6',
        value: 'Số: 10098',
        colSpan: 0,
        style: {
            font: { bold: true, size: 16, color: { argb: 'FC0303' } },
            alignment: { vertical: 'middle', horizontal: 'center' },
            fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF' },
            },
        },
    },
    {
        key: 'time_at',
        cell: 'I7',
        value: 'Ngày: 20-03-2025',
        colSpan: 0,
        style: {
            font: { bold: true, size: 12 },
            alignment: { vertical: 'middle', horizontal: 'center' },
            fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF' },
            },
        },
    },
    {
        key: 'note1',
        cell: 'A8',
        value: '-  Căn cứ vào Báo giá / Đơn đặt hàng / Hợp đồng số ... Ngày ... tháng ... năm ...',
        colSpan: 8,
        style: {
            font: { bold: false, size: 12 },
            alignment: { vertical: 'middle', horizontal: 'left' },
            fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF' },
            },
        },
    },
    {
        key: 'note2',
        cell: 'A9',
        value: '-  Căn cứ vào lệnh điều động số ... Ngày ... tháng ... năm ... Của...',
        colSpan: 8,
        style: {
            font: { bold: false, size: 12 },
            alignment: { vertical: 'middle', horizontal: 'left' },
            fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF' },
            },
        },
    },
    {
        key: 'partner',
        cell: 'B10',
        value: 'Đơn vị giao hàng: CÔNG TY TNHH ĐẤT VIỆT',
        colSpan: 1,
        style: {
            font: { bold: false, size: 12 },
            alignment: { vertical: 'middle', horizontal: 'left' },
            fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF' },
            },
        },
    },
    // {
    //     key: 'partner_name',
    //     cell: 'A11',
    //     value: 'Đại diện giao hàng: Trần Văn Anh',
    //     colSpan: 1,
    //     style: {
    //         font: { bold: false, size: 12 },
    //         alignment: { vertical: 'middle', horizontal: 'left' },
    //         fill: {
    //             type: 'pattern',
    //             pattern: 'solid',
    //             fgColor: { argb: 'FFFFFF' },
    //         },
    //     },
    // },
    // {
    //     key: 'partner',
    //     cell: 'C11',
    //     value: 'CCCD số: 123456789',
    //     colSpan: 4,
    //     style: {
    //         font: { bold: false, size: 12 },
    //         alignment: { vertical: 'middle', horizontal: 'left' },
    //         fill: {
    //             type: 'pattern',
    //             pattern: 'solid',
    //             fgColor: { argb: 'FFFFFF' },
    //         },
    //     },
    // },
    // {
    //     key: 'partner',
    //     cell: 'H11',
    //     value: 'Giấy ủy quyền số: 123456789',
    //     colSpan: 0,
    //     style: {
    //         font: { bold: false, size: 12 },
    //         alignment: { vertical: 'middle', horizontal: 'left' },
    //         fill: {
    //             type: 'pattern',
    //             pattern: 'solid',
    //             fgColor: { argb: 'FFFFFF' },
    //         },
    //     },
    // },
];
