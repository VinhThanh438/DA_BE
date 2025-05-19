import { Column, DataValidation } from 'exceljs';
import { ICustomizeCell, IHeader, ListStyle } from '../interfaces/excel.interface';

export const importSalesCommissionHeader: IHeader[] = [
    {
        header: 'Stt',
        key: 'id',
        width: 7,
        formula: 'IF(OR(B{i}<>"",C{i}<>"",D{i}<>"",E{i}<>""),ROW()-ROW($A$1),"")',
        style: ListStyle.WHITE as Partial<Column>,
        children: [],
    },
    {
        header: 'Số ĐT',
        key: 'phone',
        width: 20,
        dataValidation: {} as DataValidation,
        style: ListStyle.WHITE as Partial<Column>,
        children: [],
    },
    {
        header: 'Tên khách hàng/Nhà cung cấp',
        key: 'partner',
        width: 40,
        dataValidation: {} as DataValidation,
        style: ListStyle.WHITE as Partial<Column>,
        children: [],
    },
    {
        header: 'Loại hàng hóa',
        key: 'type',
        width: 20,
        dataValidation: {} as DataValidation,
        style: ListStyle.WHITE as Partial<Column>,
        children: [
            {
                header: 'Tổng',
                key: 'type',
                width: 20,
                style: ListStyle.YELLOW as Partial<Column>,
                children: [],
            },
        ],
    },
    {
        header: 'Phải trả đầu kỳ',
        key: 'payStart',
        width: 20,
        dataValidation: {} as DataValidation,
        style: ListStyle.WHITE as Partial<Column>,
        children: [
            {
                header: '',
                key: 'payStart',
                width: 20,
                style: ListStyle.YELLOW as Partial<Column>,
                children: [],
            },
        ],
    },
    {
        header: 'Phải trả tăng',
        key: 'payUp',
        width: 30,
        dataValidation: {} as DataValidation,
        style: ListStyle.WHITE as Partial<Column>,
        children: [
            {
                header: '',
                key: 'payUp',
                width: 20,
                style: ListStyle.YELLOW as Partial<Column>,
                children: [],
            },
        ],
    },
    {
        header: 'Phải trả giảm',
        key: 'payDown',
        width: 20,
        dataValidation: {} as DataValidation,
        style: ListStyle.WHITE as Partial<Column>,
        children: [
            {
                header: '',
                key: 'payDown',
                width: 20,
                style: ListStyle.YELLOW as Partial<Column>,
                children: [],
            },
        ],
    },
    {
        header: 'Phải trả cuối kỳ',
        key: 'payEnd',
        width: 30,
        dataValidation: {} as DataValidation,
        style: ListStyle.WHITE as Partial<Column>,
        children: [
            {
                header: '',
                key: 'payEnd',
                width: 20,
                style: ListStyle.YELLOW as Partial<Column>,
                children: [],
            },
        ],
    },
    {
        header: 'Ghi chú',
        key: 'note',
        width: 30,
        style: ListStyle.WHITE as Partial<Column>,
    },
    {
        header: 'Đề nghị thanh toán',
        key: 'payRequest',
        width: 30,
        dataValidation: {} as DataValidation,
        style: ListStyle.WHITE as Partial<Column>,
        children: [
            {
                header: '',
                key: 'payRequest',
                width: 20,
                style: ListStyle.YELLOW as Partial<Column>,
                children: [],
            },
        ],
    },
    {
        header: 'Duyệt thanh toán',
        key: 'payApproval',
        width: 30,
        dataValidation: {} as DataValidation,
        style: ListStyle.WHITE as Partial<Column>,
        children: [],
    },
];

export const importSalesCommissionCustomizeHeader: ICustomizeCell[] = [
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
        key: 'title',
        cell: 'A2',
        colSpan: 8,
        value: 'BÁO CÁO CÔNG NỢ HOA HỒNG PHẢI TRẢ',
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
        key: 'where1',
        cell: 'C3',
        colSpan: 0,
        value: 'Từ ngày',
        dataValidation: {} as DataValidation,
        style: {
            font: { bold: false, size: 12 },
            alignment: { vertical: 'middle', horizontal: 'center' },
        },
    },
    {
        key: 'startDate',
        cell: 'D3',
        colSpan: 0,
        value: undefined,
        dataValidation: {} as DataValidation,
        style: {
            font: { bold: false, size: 12 },
            alignment: { vertical: 'middle', horizontal: 'center' },
        },
    },
    {
        key: 'where2',
        cell: 'E3',
        colSpan: 0,
        value: 'Đến ngày',
        dataValidation: {} as DataValidation,
        style: {
            font: { bold: false, size: 12 },
            alignment: { vertical: 'middle', horizontal: 'center' },
        },
    },
    {
        key: 'endDate',
        cell: 'F3',
        colSpan: 0,
        value: undefined,
        dataValidation: {} as DataValidation,
        style: {
            font: { bold: false, size: 12 },
            alignment: { vertical: 'middle', horizontal: 'center' },
        },
    },
    {
        key: 'unit',
        cell: 'H3',
        colSpan: 0,
        value: 'Đvt: VNĐ',
        dataValidation: {} as DataValidation,
        style: {
            font: { bold: false, size: 12 },
            alignment: { vertical: 'middle', horizontal: 'center' },
        },
    },
];
