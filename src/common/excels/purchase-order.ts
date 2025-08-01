import { Column, DataValidation, RichText } from 'exceljs';
import { ICustomizeCell, IHeader, ListStyle, ListBorder, ListFill, ListAlignment } from '../interfaces/excel.interface';

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

export const purchaseOrderHeader: IHeader[] = [
    {
        header: 'Stt',
        key: 'stt',
        width: 5,
        // formula: 'IF(OR(B{i}<>"",C{i}<>"",D{i}<>"",E{i}<>""),ROW()-ROW($A${i}),"")',
        style: ListStyle.WHITE as Partial<Column>,
        children: [],
    },
    {
        header: 'Tên hàng và quy cách',
        key: 'product_name',
        width: 26,
        dataValidation: {} as DataValidation,
        style: ListStyle.WHITE as Partial<Column>,
        children: [],
    },
    {
        header: 'Đvt',
        key: 'unit',
        width: 7,
        dataValidation: {} as DataValidation,
        style: ListStyle.WHITE as Partial<Column>,
        children: [],
    },
    {
        header: 'Số lượng',
        key: 'quantity',
        width: 11.3,
        dataValidation: {} as DataValidation,
        style: ListStyle.WHITE as Partial<Column>,
        children: [],
    },
    {
        header: 'Đơn giá',
        key: '',
        width: 10,
        dataValidation: {} as DataValidation,
        style: ListStyle.WHITE as Partial<Column>,
        children: [
            {
                header: 'Vnđ',
                key: 'price',
                width: 10,
                dataValidation: {} as DataValidation,
                style: ListStyle.YELLOW as Partial<Column>,
                children: [],
            },
        ],
    },
    {
        header: 'Thành tiền',
        key: '',
        width: 18,
        dataValidation: {} as DataValidation,
        style: ListStyle.WHITE as Partial<Column>,
        children: [
            {
                header: 'Vnđ',
                key: 'total_money',
                width: 18,
                style: ListStyle.YELLOW as Partial<Column>,
                children: [],
            },
        ],
    },
    {
        header: 'VAT',
        key: '',
        width: 30,
        style: ListStyle.WHITE as Partial<Column>,
        children: [
            {
                header: '%',
                key: 'vat',
                width: 10,
                style: ListStyle.YELLOW as Partial<Column>,
                children: [],
            },
            {
                header: 'Vnđ',
                key: 'total_money_vat',
                width: 20,
                style: ListStyle.YELLOW as Partial<Column>,
                children: [],
            },
        ],
    },
    {
        header: 'Tổng tiền',
        key: '',
        width: 18,
        dataValidation: {} as DataValidation,
        style: ListStyle.WHITE as Partial<Column>,
        children: [
            {
                header: 'Vnđ',
                key: 'total_money_all',
                width: 18,
                style: ListStyle.YELLOW as Partial<Column>,
                children: [],
            },
        ],
    },
    {
        header: 'Hoa hồng cho người bán',
        key: 'commission_vat',
        width: 31,
        dataValidation: {} as DataValidation,
        style: ListStyle.WHITE as Partial<Column>,
        children: [],
    },
    {
        header: 'Thành tiền',
        key: '',
        width: 15,
        dataValidation: {} as DataValidation,
        style: ListStyle.WHITE as Partial<Column>,
        children: [
            {
                header: 'Dự kiến',
                key: 'commission_money',
                width: 16,
                style: ListStyle.YELLOW as Partial<Column>,
                children: [],
            },
        ],
    },
];

export const purchaseOrderCustomizeHeader: ICustomizeCell[] = [
    {
        key: 'company_name',
        cell: 'C1',
        value: 'Công ty TNHH Sản Xuất Và Thương mại Thép Đông Anh',
        colSpan: 6,
        height: 18,
        style: {
            font: { name: 'Times New Roman', bold: true, size: 15 },
            alignment: ListAlignment.LEFT,
        },
    },
    {
        key: 'address',
        cell: 'C2',
        value: 'Địa chỉ: Tổ 28 – Thị trấn Đông Anh - Hà Nội',
        colSpan: 0,
        height: 18,
        style: {
            font: { name: 'Times New Roman', bold: false, size: 12 },
            alignment: ListAlignment.LEFT,
            fill: ListFill.WHITE,
        },
    },
    {
        key: 'contact',
        cell: 'C3',
        colSpan: 0,
        value: 'Điện thoại:  0243.968.6769 – Hotline: 0978.993.999',
        height: 18,
        style: {
            font: { name: 'Times New Roman', bold: false, size: 12 },
            alignment: ListAlignment.LEFT,
            fill: ListFill.WHITE,
        },
    },
    {
        key: 'tax_code',
        cell: 'C4',
        value: 'MST: 0102378256',
        colSpan: 0,
        height: 18,
        style: {
            font: { name: 'Times New Roman', bold: false, size: 12 },
            alignment: ListAlignment.LEFT,
            fill: ListFill.WHITE,
        },
    },
    {
        key: 'iso',
        cell: 'A5',
        value: 'ISO 9001:2015',
        colSpan: 1,
        style: {
            font: { name: 'Times New Roman', bold: true, size: 12 },
            alignment: ListAlignment.CENTER,
            fill: ListFill.WHITE,
            border: {
                bottom: { style: 'double' },
            },
        },
    },
    {
        key: 'no',
        cell: 'A6',
        value: { richText },
        colSpan: 1,
        style: {
            font: { name: 'Times New Roman', bold: true, size: 14 },
            alignment: ListAlignment.CENTER,
            fill: ListFill.WHITE,
        },
    },
    {
        key: 'time_at',
        cell: 'H6',
        value: 'Ngày 28 tháng 10 năm 2023',
        colSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: false, size: 12, italic: true },
            alignment: ListAlignment.CENTER,
            fill: ListFill.WHITE,
        },
    },
    {
        key: '',
        cell: 'A7',
        colSpan: 8,
        value: 'ĐƠN ĐẶT HÀNG',
        height: 50,
        style: {
            font: { name: 'Times New Roman', bold: true, size: 28 },
            alignment: ListAlignment.CENTER,
            fill: ListFill.WHITE,
        },
    },
    {
        key: '',
        cell: 'J7',
        colSpan: 1,
        value: 'HOA HỒNG',
        height: 50,
        style: {
            font: { name: 'Times New Roman', bold: true, size: 20 },
            alignment: ListAlignment.CENTER,
            fill: ListFill.WHITE,
        },
    },
    {
        key: '',
        cell: 'B8',
        value: 'Tên nhà cung cấp',
        colSpan: 0,
        height: 23.25,
        style: {
            font: { name: 'Times New Roman', bold: true, size: 12 },
            alignment: ListAlignment.LEFT,
            fill: ListFill.WHITE,
        },
    },
    {
        key: '',
        cell: 'C8',
        value: ':',
        colSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: true, size: 12 },
            alignment: ListAlignment.LEFT,
            fill: ListFill.WHITE,
        },
    },
    {
        key: 'partner_name',
        cell: 'D8',
        value: 'CÔNG TY TNHH TM VÀ XD DONGA',
        colSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: true, size: 13 },
            alignment: ListAlignment.LEFT,
            fill: ListFill.WHITE,
        },
    },
    {
        key: '',
        cell: 'J8',
        value: 'Mr :',
        colSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: true, size: 13 },
            alignment: ListAlignment.LEFT,
            fill: ListFill.WHITE,
        },
    },
    {
        key: 'commission_name',
        cell: 'K8',
        value: 'Dũng',
        colSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: true, size: 13 },
            alignment: ListAlignment.LEFT,
            fill: ListFill.WHITE,
        },
    },
    {
        key: '',
        cell: 'B9',
        value: 'Địa chỉ',
        colSpan: 0,
        height: 23.25,
        style: {
            font: { name: 'Times New Roman', bold: false, size: 12 },
            alignment: ListAlignment.LEFT,
            fill: ListFill.WHITE,
        },
    },
    {
        key: '',
        cell: 'C9',
        value: ':',
        colSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: false, size: 12 },
            alignment: ListAlignment.LEFT,
            fill: ListFill.WHITE,
        },
    },
    {
        key: 'address',
        cell: 'D9',
        value: 'Gia Lâm - Hà Nội - Việt Nam',
        colSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: true, size: 12 },
            alignment: ListAlignment.LEFT,
            fill: ListFill.WHITE,
        },
    },
    {
        key: '',
        cell: 'J9',
        value: 'Tài khoản:',
        colSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: true, size: 12 },
            alignment: ListAlignment.LEFT,
            fill: ListFill.WHITE,
        },
    },
    {
        key: 'commission_account',
        cell: 'K9',
        value: '123.456.789',
        colSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: true, size: 12 },
            alignment: ListAlignment.LEFT,
            fill: ListFill.WHITE,
        },
    },
    {
        key: '',
        cell: 'B10',
        value: 'Đại diện',
        colSpan: 0,
        height: 23.25,
        style: {
            font: { name: 'Times New Roman', bold: false, size: 12 },
            alignment: ListAlignment.LEFT,
            fill: ListFill.WHITE,
        },
    },
    {
        key: '',
        cell: 'C10',
        value: ':',
        colSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: false, size: 12 },
            alignment: ListAlignment.LEFT,
            fill: ListFill.WHITE,
        },
    },
    {
        key: 'represent',
        cell: 'D10',
        value: 'Trần văn A',
        colSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: true, size: 12 },
            alignment: ListAlignment.LEFT,
            fill: ListFill.WHITE,
        },
    },
    {
        key: 'phone_number',
        cell: 'F10',
        value: 'ĐT: 0987.654.321',
        colSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: false, size: 12 },
            alignment: ListAlignment.LEFT,
            fill: ListFill.WHITE,
        },
    },
    {
        key: 'email',
        cell: 'H10',
        value: 'Email: tran@gmail.com',
        colSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: false, size: 12 },
            alignment: ListAlignment.LEFT,
            fill: ListFill.WHITE,
        },
    },
    {
        key: '',
        cell: 'J10',
        value: 'Ngân hàng:',
        colSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: false, size: 12 },
            alignment: ListAlignment.LEFT,
            fill: ListFill.WHITE,
        },
    },
    {
        key: 'commission_bank',
        cell: 'K10',
        value: 'MB',
        colSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: false, size: 12 },
            alignment: ListAlignment.LEFT,
            fill: ListFill.WHITE,
        },
    },
    {
        key: 'note',
        cell: 'B11',
        value: 'Căn cứ vào báo giá số………...., Công ty TNHH SX TM Thép Đông Anh gửi đến quý công ty đơn hàng với nội dung sau:',
        colSpan: 0,
        height: 23.25,
        style: {
            font: { name: 'Times New Roman', bold: false, size: 12 },
            alignment: ListAlignment.LEFT,
            fill: ListFill.WHITE,
        },
    },
    {
        key: '',
        cell: 'J11',
        value: 'Số điện thoại:',
        colSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: false, size: 12 },
            alignment: ListAlignment.LEFT,
            fill: ListFill.WHITE,
        },
    },
    {
        key: 'commission_phone',
        cell: 'K11',
        value: '0987.654.321',
        colSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: false, size: 12 },
            alignment: ListAlignment.LEFT,
            fill: ListFill.WHITE,
        },
    },
];

export const purchaseOrderFooter: ICustomizeCell[] = [
    {
        key: '',
        cell: 'A20',
        value: 'Tổng',
        colSpan: 1,
        rowSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: true, size: 14 },
            alignment: ListAlignment.CENTER,
            fill: ListFill.WHITE,
            border: ListBorder.THIN,
        },
    },
    {
        key: 'f_unit',
        cell: 'C20',
        value: 'Kg',
        colSpan: 0,
        rowSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: false, size: 14 },
            alignment: ListAlignment.CENTER,
            fill: ListFill.WHITE,
            border: ListBorder.THIN,
        },
    },
    {
        key: 'f_total_quantity',
        cell: 'D20',
        value: 96000,
        colSpan: 0,
        rowSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: true, size: 14 },
            alignment: ListAlignment.CENTER,
            fill: ListFill.WHITE,
            border: ListBorder.THIN,
        },
    },
    {
        key: 'f_total_money',
        cell: 'F20',
        value: 120000000,
        colSpan: 0,
        rowSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: true, size: 14 },
            alignment: ListAlignment.CENTER,
            fill: ListFill.WHITE,
            border: ListBorder.THIN,
        },
    },
    {
        key: 'f_total_tax',
        cell: 'H20',
        value: 900000,
        colSpan: 0,
        rowSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: true, size: 14 },
            alignment: ListAlignment.CENTER,
            fill: ListFill.WHITE,
            border: ListBorder.THIN,
        },
    },
    {
        key: 'f_total_money_with_tax',
        cell: 'I20',
        value: 1580000000,
        colSpan: 0,
        rowSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: true, size: 14 },
            alignment: ListAlignment.CENTER,
            fill: ListFill.WHITE,
            border: ListBorder.THIN,
        },
    },
    {
        key: 'f_total_commission_title',
        cell: 'J20',
        value: 'Tổng HH',
        colSpan: 0,
        rowSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: true, size: 14 },
            alignment: ListAlignment.CENTER,
            fill: ListFill.WHITE,
            border: ListBorder.THIN,
        },
    },
    {
        key: 'f_total_commission',
        cell: 'K20',
        value: 750000,
        colSpan: 0,
        rowSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: true, size: 14 },
            alignment: ListAlignment.CENTER,
            fill: ListFill.WHITE,
            border: ListBorder.THIN,
        },
    },
    {
        key: 'f_total_commission',
        cell: 'A21',
        value: 'Bằng chữ:',
        colSpan: 8,
        rowSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: false, size: 14 },
            alignment: ListAlignment.CENTER,
            fill: ListFill.WHITE,
            border: ListBorder.THIN,
        },
    },
    {
        key: 'f_note1_no',
        cell: 'A22',
        value: '1',
        colSpan: 0,
        rowSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: false, size: 12 },
            alignment: ListAlignment.CENTER,
            fill: ListFill.WHITE,
        },
    },
    {
        key: 'f_note1_title',
        cell: 'B22',
        value: 'Chất lượng hàng',
        colSpan: 0,
        rowSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: true, size: 13 },
            alignment: ListAlignment.LEFT,
            fill: ListFill.WHITE,
        },
    },
    {
        key: '',
        cell: 'C22',
        value: ':',
        colSpan: 0,
        rowSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: true, size: 12 },
            alignment: ListAlignment.CENTER,
            fill: ListFill.WHITE,
        },
    },
    {
        key: 'f_note1_content',
        cell: 'D22',
        value: 'Mới 100% chưa qua sử dụng, chất lượng theo công bố',
        colSpan: 5,
        rowSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: false, size: 13 },
            alignment: ListAlignment.LEFT,
            fill: ListFill.WHITE,
        },
    },

    {
        key: 'f_note2_no',
        cell: 'A23',
        value: '2',
        colSpan: 0,
        rowSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: false, size: 12 },
            alignment: ListAlignment.CENTER,
            fill: ListFill.WHITE,
        },
    },
    {
        key: 'f_note2_title',
        cell: 'B23',
        value: 'Địa điểm giao hàng',
        colSpan: 0,
        rowSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: true, size: 13 },
            alignment: ListAlignment.LEFT,
            fill: ListFill.WHITE,
        },
    },
    {
        key: '',
        cell: 'C23',
        value: ':',
        colSpan: 0,
        rowSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: true, size: 12 },
            alignment: ListAlignment.CENTER,
            fill: ListFill.WHITE,
        },
    },
    {
        key: 'f_note2_content',
        cell: 'D23',
        value: 'Kho bên mua, cước phí vận chuyển bên bán chịu',
        colSpan: 5,
        rowSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: false, size: 13 },
            alignment: ListAlignment.LEFT,
            fill: ListFill.WHITE,
        },
    },
    {
        key: 'f_note3_no',
        cell: 'A24',
        value: '3',
        colSpan: 0,
        rowSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: false, size: 12 },
            alignment: ListAlignment.CENTER,
            fill: ListFill.WHITE,
        },
    },
    {
        key: 'f_note3_title',
        cell: 'B24',
        value: 'Phương thức giao hàng',
        colSpan: 0,
        rowSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: true, size: 13 },
            alignment: ListAlignment.LEFT,
            fill: ListFill.WHITE,
        },
    },
    {
        key: '',
        cell: 'C24',
        value: ':',
        colSpan: 0,
        rowSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: true, size: 12 },
            alignment: ListAlignment.CENTER,
            fill: ListFill.WHITE,
        },
    },
    {
        key: 'f_note3_content',
        cell: 'D24',
        value: 'Hàng giao kg thực tế, bên mua hạ hàng',
        colSpan: 5,
        rowSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: false, size: 13 },
            alignment: ListAlignment.LEFT,
            fill: ListFill.WHITE,
        },
    },
    {
        key: 'f_note4_no',
        cell: 'A25',
        value: '4',
        colSpan: 0,
        rowSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: false, size: 12 },
            alignment: ListAlignment.CENTER,
            fill: ListFill.WHITE,
        },
    },
    {
        key: 'f_note4_title',
        cell: 'B25',
        value: 'Thanh toán',
        colSpan: 0,
        rowSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: true, size: 13 },
            alignment: ListAlignment.LEFT,
            fill: ListFill.WHITE,
        },
    },
    {
        key: '',
        cell: 'C25',
        value: ':',
        colSpan: 0,
        rowSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: true, size: 12 },
            alignment: ListAlignment.CENTER,
            fill: ListFill.WHITE,
        },
    },
    {
        key: 'f_note4_content',
        cell: 'D25',
        value: 'Thanh toán 100% ngay khi đặt hàng',
        colSpan: 5,
        rowSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: false, size: 13 },
            alignment: ListAlignment.LEFT,
            fill: ListFill.WHITE,
        },
    },
    {
        key: 'f_note5_no',
        cell: 'A26',
        value: '5',
        colSpan: 0,
        rowSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: false, size: 12 },
            alignment: ListAlignment.CENTER,
            fill: ListFill.WHITE,
        },
    },
    {
        key: 'f_note5_title',
        cell: 'B26',
        value: 'Thời hạn báo giá',
        colSpan: 0,
        rowSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: true, size: 13 },
            alignment: ListAlignment.LEFT,
            fill: ListFill.WHITE,
        },
    },
    {
        key: '',
        cell: 'C26',
        value: ':',
        colSpan: 0,
        rowSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: true, size: 12 },
            alignment: ListAlignment.CENTER,
            fill: ListFill.WHITE,
        },
    },
    {
        key: 'f_note5_content',
        cell: 'D26',
        value: 'Hết ngày 30/05/2025',
        colSpan: 5,
        rowSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: false, size: 13 },
            alignment: ListAlignment.LEFT,
            fill: ListFill.WHITE,
        },
    },
    {
        key: 'f_note6_content',
        cell: 'A27',
        value: 'Rất mong nhận được sự hợp tác của Quý công ty',
        colSpan: 8,
        rowSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: true, size: 13, italic: true },
            alignment: ListAlignment.CENTER,
            fill: ListFill.WHITE,
        },
    },
    {
        key: 'f_signature_Partner',
        cell: 'A28',
        value: 'XÁC NHẬN CỦA KHÁCH HÀNG',
        colSpan: 3,
        rowSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: true, size: 13 },
            alignment: ListAlignment.CENTER,
            fill: ListFill.WHITE,
        },
    },
    {
        key: 'f_signature_Company',
        cell: 'F28',
        value: 'CT.TNHH SX TM THÉP ĐÔNG ANH',
        colSpan: 3,
        rowSpan: 0,
        style: {
            font: { name: 'Times New Roman', bold: true, size: 13 },
            alignment: ListAlignment.CENTER,
            fill: ListFill.WHITE,
        },
    },
];

interface IFakeData {
    id: number;
    product_name: string;
    product_code: string;
    unit: string;
    unit_name: string;
    quantity: number;
    document: number;
    real: number;
    price: number;
    total_price: number;
    incidental_costs: number;
    kg: number;
    money: number;
}

export const fakeImportWarehouseData: IFakeData[] = [
    {
        id: 1,
        product_name: 'Sắt hộp 20x40x1.2',
        product_code: 'SH204012',
        unit: 'Cây',
        unit_name: 'Cây',
        quantity: 10,
        document: 10,
        real: 9,
        price: 100000,
        total_price: 1000000,
        incidental_costs: 0,
        kg: -1,
        money: -1 * 100000,
    },
    {
        id: 2,
        product_name: 'Sắt hộp 20x40x1.2',
        product_code: 'SH204012',
        unit: 'Cây',
        unit_name: 'Cây',
        quantity: 5,
        document: 5,
        real: 7,
        price: 100000,
        total_price: 500000,
        incidental_costs: 0,
        kg: 2,
        money: 2 * 500000,
    },
    {
        id: 3,
        product_name: 'Sắt hộp 20x40x1.2',
        product_code: 'SH204012',
        unit: 'Cây',
        unit_name: 'Cây',
        quantity: 8,
        document: 8,
        real: 9,
        price: 100000,
        total_price: 800000,
        incidental_costs: 0,
        kg: 1,
        money: 1 * 800000,
    },
];
