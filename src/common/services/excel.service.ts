import { renderExcelHeader } from '@common/helpers/excel';
import * as ExcelJS from 'exceljs';
import {
    importWarehouseHeader,
    importWarehouseCustomizeHeader,
    importWarehouseFooter,
    fakeImportWarehouseData,
} from '@common/excels/importWarehouseHeader';

import {
    purchaseOrderHeader,
    purchaseOrderCustomizeHeader,
    purchaseOrderFooter,
} from '@common/excels/purchaseOrderHeader';
import { dataFakePayable, importPaymentCustomizeHeader, importPaymentHeader } from '@common/excels/payment';
import { importSalesCommissionCustomizeHeader, importSalesCommissionHeader } from '@common/excels/salesCommission';
import { dataFakeBank, importBankCustomizeHeader, importBankHeader } from '@common/excels/bank';
import { TransactionTyles } from '@common/interfaces/excel.interface';
import {
    dataFakeDebtCompartion,
    importDebtCompartionCustomizeFooter,
    importDebtCompartionCustomizeHeader,
    importDebtCompartionHeader,
} from '@common/excels/debtComparison';
import {
    importQuotationCustomizeFooter,
    importQuotationCustomizeHeader,
    importQuotationHeader,
} from '@common/excels/quotation';
import { OrderService } from './order.service';
import { OrganizationService } from './organization.service';
import { Orders } from '@prisma/client/default';

export class ExcelService {
    private static instance: ExcelService;
    private orderService = OrderService.getInstance();
    private organizationService = OrganizationService.getInstance();

    private constructor() {}

    public static getInstance(): ExcelService {
        if (!this.instance) {
            this.instance = new ExcelService();
        }
        return this.instance;
    }
    private addBorder(worksheet: ExcelJS.Worksheet, startCol: number, endCol: number, row: number): void {
        for (let col = startCol; col <= endCol; col++) {
            const cell = worksheet.getCell(row, col);
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
        }
    }

    private getTotalCell(worksheet: ExcelJS.Worksheet, col: string): number {
        let sum = 0;
        worksheet.eachRow((row) => {
            const cell = row.getCell(col);
            if (cell.value && !isNaN(Number(cell.value))) {
                sum += Number(cell.value);
            }
        });
        return sum;
    }
    // bieu mau don dat hang
    public async exportExcelPurchaseOrder(id: number): Promise<string> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Đặt hàng');

        worksheet.pageSetup.printArea = 'A1:G47';

        worksheet.pageSetup.margins = {
            left: 0.7,
            right: 0.7,
            top: 0.35,
            bottom: 0.75,
            header: 0,
            footer: 0,
        };

        const logo = workbook.addImage({
            filename: 'uploads/access/logos/logo.png',
            extension: 'png',
        });

        worksheet.mergeCells('A2', 'B4');
        worksheet.addImage(logo, 'A2:B4');

        const logo_right = workbook.addImage({
            filename: 'uploads/access/logos/logo2.png',
            extension: 'png',
        });

        worksheet.mergeCells('H2', 'I4');
        worksheet.addImage(logo_right, 'H2:I4');

        const startRow = 12;
        const startColumn = 1;

        // lay du lieu don hang
        const order = (await this.orderService.findById(id)) as any;

        if (!order) {
            throw new Error('id.not_found');
        }

        const customizeHeader = purchaseOrderCustomizeHeader.map((item) => {
            switch (item.key) {
                case 'company_name':
                    return {
                        ...item,
                        value: order.organization.name || '',
                    };
                case 'address':
                    return {
                        ...item,
                        value: order.organization.address || '',
                    };
                case 'contact':
                    return {
                        ...item,
                        value: `Điện thoại:  ${order.organization.phone_number || ''} – Hotline: ${order.organization.hotline || ''}`,
                    };
                case 'tax_code':
                    return {
                        ...item,
                        value: ` MST: ${order.organization.tax_code || ''}`,
                    };
                case 'time_at':
                    const timeAt = new Date(order.time_at);
                    const timeAtString = `Ngày ${timeAt.getDate()} tháng ${timeAt.getMonth() + 1} năm ${timeAt.getFullYear()}`;
                    return {
                        ...item,
                        value: timeAtString,
                    };
                case 'partner_name':
                    return {
                        ...item,
                        value: order.partner.name || '',
                    };

                case 'commission_name':
                    return {
                        ...item,
                        value: order.partner.representative_name || '',
                    };
                case 'address':
                    return {
                        ...item,
                        value: order.address || '',
                    };
                case 'commission_account':
                    return {
                        ...item,
                        value: order.partner.account_number || '',
                    };
                case 'represent':
                    return {
                        ...item,
                        value: order.partner.representative_name || '',
                    };
                case 'phone_number':
                    return {
                        ...item,
                        value: `ĐT: ${order.partner.representative_phone || ''}`,
                    };
                case 'email':
                    return {
                        ...item,
                        value: `Email: ${order.partner.representative_email || ''}`,
                    };
                case 'note':
                    return {
                        ...item,
                        value: `Căn cứ vào báo giá số………...., ${order.organization.name || 'Công ty TNHH SX TM Thép Đông Anh'} gửi đến quý công ty đơn hàng với nội dung sau:`,
                    };
                default:
                    return item;
            }
        });

        const dataBody = order.details.map((item: any, index: number) => {
            return {
                stt: index + 1,
                product_name: item.product.name,
                product_code: item.product.code,
                unit: item.unit.name,
                unit_name: item.product.unit.name,
                quantity: item.quantity,
                price: Number(item.price),
                total_money: item.quantity * Number(item.price),
                vat: item.vat,
                total_money_vat: (item.quantity * Number(item.price) * item.vat) / 100,
                total_money_all: item.quantity * Number(item.price) * (1 + item.vat / 100),
                commission_vat: item.commission,
                commission_money: (item.quantity * Number(item.price) * item.commission) / 100,
            };
        });

        renderExcelHeader(
            worksheet,
            purchaseOrderHeader,
            startRow,
            startColumn,
            customizeHeader,
            dataBody,
            purchaseOrderFooter,
        );

        const path = `uploads/Đơn đặt hàng.xlsx`;

        // Save the workbook to a file
        await workbook.xlsx.writeFile(path);

        return path;
    }

    // bieu mau hop dong mua hang
    public async exportExcelPurchaseContract(id: number): Promise<string> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        // Save the workbook to a file
        const path = `uploads/Hợp đồng mua hàng.xlsx`;
        await workbook.xlsx.writeFile(path);

        return path;
    }

    // bieu mau nhap kho vat tu
    public async exportExcelImportWarehouse(id: number): Promise<string> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        worksheet.pageSetup.printArea = 'A1:G47';

        worksheet.pageSetup.margins = {
            left: 0.7,
            right: 0.7,
            top: 0.35,
            bottom: 0.75,
            header: 0,
            footer: 0,
        };

        const logo = workbook.addImage({
            filename: 'uploads/access/logos/logo.png',
            extension: 'png',
        });

        worksheet.mergeCells('A1', 'B4');
        worksheet.addImage(logo, 'A1:B4');

        const startRow = 15;
        const startColumn = 1;

        renderExcelHeader(
            worksheet,
            importWarehouseHeader,
            startRow,
            startColumn,
            importWarehouseCustomizeHeader,
            fakeImportWarehouseData,
            importWarehouseFooter,
        );

        const path = `uploads/import_warehouse_${id}.xlsx`;

        // Save the workbook to a file
        await workbook.xlsx.writeFile(path);

        return path;
    }

    // bieu mau hoa hong cho nguoi ban hang
    public async exportExcelSalesCommission(query?: any): Promise<string> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');
        const startRow = 5;
        const startColumn = 1;
        renderExcelHeader(
            worksheet,
            importSalesCommissionHeader,
            startRow,
            startColumn,
            importSalesCommissionCustomizeHeader,
            fakeImportWarehouseData,
            [],
        );
        const lastRow = worksheet.rowCount;
        worksheet.getCell('D3').value = query.startDate;
        worksheet.getCell('F3').value = query.endDate;
        worksheet.getCell('E6').value = { formula: `SUM(E7: E${lastRow})` };
        worksheet.getCell('F6').value = { formula: `SUM(F7: F${lastRow})` };
        worksheet.getCell('G6').value = { formula: `SUM(G7: G${lastRow})` };
        worksheet.getCell('H6').value = { formula: `SUM(H7: H${lastRow})` };
        worksheet.getCell('J6').value = { formula: `SUM(J7: J${lastRow})` };
        const path = 'uploads/sales_commission.xlsx';

        // Save the workbook to a file
        await workbook.xlsx.writeFile(path);

        return path;
    }

    // bieu mau báo cáo công nợ phải trả
    public async exportExcelPayment(query?: any): Promise<string> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');
        const startRow = 5;
        const startColumn = 1;
        renderExcelHeader(
            worksheet,
            importPaymentHeader,
            startRow,
            startColumn,
            importPaymentCustomizeHeader,
            dataFakePayable,
            [],
        );
        const lastRow = worksheet.rowCount;
        worksheet.getCell('D3').value = query.startDate || '16/4/2025';
        worksheet.getCell('F3').value = query.endDate || '16/5/2025';
        worksheet.getCell('E6').value = { formula: `SUM(E7: E${lastRow})` };
        worksheet.getCell('F6').value = { formula: `SUM(F7: F${lastRow})` };
        worksheet.getCell('G6').value = { formula: `SUM(G7: G${lastRow})` };
        worksheet.getCell('H6').value = { formula: `SUM(H7: H${lastRow})` };
        worksheet.getCell('I6').value = { formula: `SUM(I7: I${lastRow})` };
        worksheet.getCell('J6').value = { formula: `SUM(J7: J${lastRow})` };
        const path = 'uploads/export_payment.xlsx';

        // Save the workbook to a file
        await workbook.xlsx.writeFile(path);

        return path;
    }
    //biểu mẫu giao dịch
    public async exportExcelTransaction(query?: any): Promise<string> {
        const type = query?.type;
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');
        const startRow = 5;
        const startColumn = 1;
        renderExcelHeader(
            worksheet,
            importBankHeader,
            startRow,
            startColumn,
            importBankCustomizeHeader,
            dataFakeBank,
            [],
        );

        worksheet.mergeCells('A2:C2');
        worksheet.getCell('A2').value =
            type === 'mb'
                ? 'Nhật ký giao dịch Ngân hàng MB'
                : type === 'bidv'
                  ? 'Nhật ký giao dịch Ngân hàng BIDV'
                  : 'Nhật ký giao dịch Qũy tiền mặt';
        worksheet.getCell('A2').font = { bold: true, size: 14 };
        worksheet.mergeCells('D2:G2');
        worksheet.getCell('D2').value = type === 'mb' ? 'MB BANK' : type === 'bidv' ? 'BIDV' : 'Sổ quỹ';
        worksheet.getCell('D2').font = { bold: true, size: 32 };
        worksheet.getCell('D2').alignment = { vertical: 'middle', horizontal: 'center' };
        const lastRow = worksheet.rowCount;
        worksheet.mergeCells(`A${lastRow + 1}:C${lastRow + 1}`);
        worksheet.getCell(`A${lastRow + 1}:C${lastRow + 1}`).value = 'Tổng';
        worksheet.getCell(`A${lastRow + 1}:C${lastRow + 1}`).font = { size: 14, bold: true };
        worksheet.getCell(`A${lastRow + 1}:C${lastRow + 1}`).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell(`E${lastRow + 1}`).value = { formula: `SUM(E${startRow + 2}:E${lastRow})` };
        worksheet.getCell(`F${lastRow + 1}`).value = { formula: `SUM(F${startRow + 2}:F${lastRow})` };
        worksheet.getCell(`G${lastRow + 1}`).value = {
            formula: `G${startRow}  + E${lastRow} - F${lastRow}`,
        };
        worksheet.mergeCells(`A${lastRow + 2}:G${lastRow + 2}`);
        worksheet.getCell(`A${lastRow + 2}`).value = 'Số dư bằng chữ:';
        worksheet.getCell(`A${lastRow + 2}`).font = { size: 14 };
        worksheet.getCell(`A${lastRow + 2}`).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        };
        this.addBorder(worksheet, 1, 7, lastRow + 1);
        const path = 'uploads/export_bank.xlsx';

        await workbook.xlsx.writeFile(path);

        return path;
    }
    //biểu mẫu đối chiếu công nợ
    public async exportExcelDebtComparison(dataInput: any): Promise<string> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');
        const startRow = 17;
        const startColumn = 1;
        renderExcelHeader(
            worksheet,
            importDebtCompartionHeader,
            startRow,
            startColumn,
            importDebtCompartionCustomizeHeader,
            dataFakeDebtCompartion,
            [],
        );
        const lastRow = worksheet.rowCount;
        worksheet.mergeCells(`A${lastRow + 1}:D${lastRow + 1}`);
        worksheet.getCell(`A${lastRow + 1}`).value = 'Tổng';
        (worksheet.getCell(`A${lastRow + 1}`).alignment = { vertical: 'middle', horizontal: 'center' }),
            (worksheet.getCell(`M${lastRow + 1}`).value = 'Tổng');
        (worksheet.getCell(`M${lastRow + 1}`).alignment = { vertical: 'middle', horizontal: 'center' }),
            (worksheet.getCell(`A${lastRow + 1}`).font = { bold: true, size: 14 });
        worksheet.getCell(`M${lastRow + 1}`).font = { bold: true, size: 14 };
        worksheet.getCell(`E${lastRow + 1}`).value = { formula: `SUM(E${startRow + 2}: E${lastRow})` };
        worksheet.getCell(`F${lastRow + 1}`).value = { formula: `SUM(F${startRow + 2}: F${lastRow})` };
        worksheet.getCell(`I${lastRow + 1}`).value = { formula: `SUM(I${startRow + 2}: I${lastRow}) + D14` };
        worksheet.getCell(`L${lastRow + 1}`).value = { formula: `SUM(L${startRow + 2}: L${lastRow}) + G14` };
        worksheet.getCell(`N${lastRow + 1}`).value = { formula: `SUM(N${startRow + 2}: N${lastRow})` };
        worksheet.getCell(`O${lastRow + 1}`).value = { formula: `SUM(O${startRow + 2}: O${lastRow})` };
        worksheet.getCell(`R${lastRow + 1}`).value = { formula: `SUM(R${startRow + 2}: R${lastRow})` };
        worksheet.getCell(`U${lastRow + 1}`).value = { formula: `SUM(U${startRow + 2}: U${lastRow}) + O14` };
        this.addBorder(worksheet, 1, 21, lastRow + 1);
        worksheet.mergeCells(`A${lastRow + 2}:L${lastRow + 2}`);
        worksheet.getCell(`A${lastRow + 2}`).value = 'Bằng chữ:';
        worksheet.getCell(`A${lastRow + 2}`).font = { underline: true, size: 14, bold: true };
        worksheet.getCell(`A${lastRow + 2}`).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        };
        worksheet.mergeCells(`A${lastRow + 3}:J${lastRow + 3}`);
        worksheet.getCell(`A${lastRow + 3}`).value =
            'Biên bản này được lập thành 02 bản có giá trị như nhau. Mỗi bên giữ 01 bản làm cơ sở cho việc thanh toán sau này giữa hai bên. trong vòng 03 ngày làm việc kể từ ngày nhận được biên bản đối chiếu công nợ này mà bên B không nhận được phản hồi từ quý công ty thì công nợ trên coi như được chấp nhận';
        worksheet.getRow(lastRow + 3).height = 40;
        worksheet.getCell(`A${lastRow + 3}`).alignment = { wrapText: true };
        worksheet.mergeCells(`A${lastRow + 5}: E${lastRow + 5}`);
        worksheet.getCell(`A${lastRow + 5}`).value = 'ĐẠI DIỆN BÊN A';
        worksheet.getCell(`A${lastRow + 5}`).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell(`A${lastRow + 5}`).font = { size: 14, bold: true };
        worksheet.mergeCells(`F${lastRow + 5}: J${lastRow + 5}`);
        worksheet.getCell(`F${lastRow + 5}`).value = 'ĐẠI DIỆN BÊN B';
        worksheet.getCell(`F${lastRow + 5}`).font = { size: 14, bold: true };
        worksheet.getCell(`F${lastRow + 5}`).alignment = { vertical: 'middle', horizontal: 'center' };
        const path = 'uploads/export_debt_comparison.xlsx';
        await workbook.xlsx.writeFile(path);
        return path;
    }

    public async exportExcelQuotation(query?: any): Promise<string> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');
        const startRow = 12;
        const startColumn = 1;
        renderExcelHeader(
            worksheet,
            importQuotationHeader,
            startRow,
            startColumn,
            importQuotationCustomizeHeader,
            [],
            [],
            // importQuotationCustomizeFooter,
        );
        const path = 'uploads/export_quotation.xlsx';
        await workbook.xlsx.writeFile(path);
        return path;
    }
}
