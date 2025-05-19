import { Column, DataValidation } from 'exceljs';
import { ICustomizeCell, IHeader, ListStyle } from '../interfaces/excel.interface';

export const importBankHeader: IHeader[] = [
    {
        header: 'Stt',
        key: 'id',
        width: 7,
        formula: 'IF(OR(B{i}<>"",C{i}<>"",D{i}<>"",E{i}<>""),ROW()-ROW($A$1),"")',
        style: ListStyle.WHITE as Partial<Column>,
        children: [],
    },
    {
        header: 'Ngày',
        key: 'date',
        width: 20,
        dataValidation: {} as DataValidation,
        style: ListStyle.WHITE as Partial<Column>,
        children: [],
    },
    {
        header: 'Nội dung',
        key: 'content',
        width: 40,
        dataValidation: {} as DataValidation,
        style: ListStyle.WHITE as Partial<Column>,
        children: [],
    },
    {
        header: 'Mã khách hàng',
        key: 'code',
        width: 20,
        dataValidation: {} as DataValidation,
        style: ListStyle.WHITE as Partial<Column>,
    },
    {
        header: 'Số dư đầu kỳ',
        key: 'beginningBalance',
        width: 20,
        dataValidation: {} as DataValidation,
        style: ListStyle.WHITE as Partial<Column>,
        children: [
            {
                header: 'Phát sinh có',
                key: 'arise',
                width: 20,
                style: ListStyle.WHITE as Partial<Column>,
                children: [],
            },
            {
                header: 'Phát sinh nợ',
                key: 'debt',
                width: 20,
                style: ListStyle.WHITE as Partial<Column>,
                children: [],
            },
        ],
    },
    {
        header: '1000000',
        key: 'balance',
        width: 30,
        dataValidation: {} as DataValidation,
        style: ListStyle.WHITE as Partial<Column>,
        children: [
            {
                header: 'Số dư',
                key: 'balance',
                width: 20,
                style: ListStyle.WHITE as Partial<Column>,
                children: [],
            },
        ],
    },
];

export const importBankCustomizeHeader: ICustomizeCell[] = [
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
        dataValidation: {} as DataValidation,
        style: {
            font: { bold: false, size: 12 },
            alignment: { vertical: 'middle', horizontal: 'left' },
        },
    },
];

export const dataFakeBank = [
    {
        id: 1,
        date: '12/5/2025',
        content: 'Xuân mai thanh toán tiền thép HĐ SỐ',
        code: 'XM123',
        arise: 350000000,
        debt: null,
        balance: null,
    },
    {
        id: 2,
        date: '12/5/2025',
        content: 'Đông Anh thanh toán tiền cho HĐ So',
        code: 'AB123',
        arise: null,
        debt: 200000000,
        balance: null,
    },
    {
        id: 3,
        date: '12/5/2025',
        content: 'Hòa Phát thanh toán tiền cho HĐ So',
        code: 'HP123',
        arise: 500000000,
        debt: 200000000,
        balance: null,
    },
];
