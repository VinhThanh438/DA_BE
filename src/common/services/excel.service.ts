import { getMaxDepth, renderExcelHeader } from '@common/helpers/excel';
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
import { importPaymentCustomizeHeader, importPaymentHeader } from '@common/excels/payment';
import {
    dataFakeCommistion,
    importSalesCommissionCustomizeHeader,
    importSalesCommissionHeader,
} from '@common/excels/salesCommission';
import { dataFakeBank, importBankCustomizeHeader, importBankHeader } from '@common/excels/bank';
import {
    dataFakeDebtCompartion,
    importDebtCompartionCustomizeHeader,
    importDebtCompartionHeader,
} from '@common/excels/debtComparison';
import { dataFakeQuotation, importQuotationCustomizeHeader, importQuotationHeader } from '@common/excels/quotation';
import { OrderService } from './order.service';
import { OrganizationService } from './organization.service';
import { PartnerService } from './partner.service';
import puppeteer from 'puppeteer';
import fs from 'fs';
import { paymentHeaderDPF } from '@common/pdfs/payment';
import { bankPDF } from '@common/pdfs/bank';
import { paymentCommissionDPF } from '@common/pdfs/paymentCommission';
import { debtComparisonPDF } from '@common/pdfs/debtComparison';
import { quotationPDF } from '@common/pdfs/quotation';
import { orderPDF } from '@common/pdfs/order';
import { QuotationService } from './quotation.service';
import { importWarehousePDF } from '@common/pdfs/ImportWarehouse';
import { EmployeeService } from './employee.service';
import { UserService } from './user.service';
import { InventoryService } from './inventory.service';
import { TransactionService } from './transaction.service';
export class ExcelService {
    private static instance: ExcelService;
    private orderService = OrderService.getInstance();
    private organizationService = OrganizationService.getInstance();
    private partnerService = PartnerService.getInstance();
    private quotationService = QuotationService.getInstance();
    private userService = UserService.getInstance();
    private inventoryService = InventoryService.getInstance();
    private transactionService = TransactionService.getInstance();

    private constructor() {}

    public static getInstance(): ExcelService {
        if (!this.instance) {
            this.instance = new ExcelService();
        }
        return this.instance;
    }
    public static getData = [];

    private getTotal = (data: any[], key: string): number => {
        return data.reduce((sum, obj) => sum + (obj[key] || 0), 0);
    };
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

    private async convertPDF(pathPDF: string, contentHtml: string) {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(contentHtml);
        const pdfBuffer = await page.pdf({
            format: 'A4',
            landscape: true,
            printBackground: true,
            // width: 210
            margin: {
                top: '50px',
                right: '50px',
                bottom: '50px',
                left: '50px',
            },
        });
        await browser.close();
        fs.writeFileSync(pathPDF, pdfBuffer);
    }
    // bieu mau don dat hang
    public async exportExcelPurchaseOrder(query: any): Promise<string> {
        let path = '';
        // lay du lieu don hang
        const order = (await this.orderService.findById(Number(query.id))) as any;

        if (!order) {
            throw new Error('id.not_found');
        }
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
        if (query.fileType === 'excel') {
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

            renderExcelHeader(
                worksheet,
                purchaseOrderHeader,
                startRow,
                startColumn,
                customizeHeader,
                dataBody,
                purchaseOrderFooter,
            );

            path = `uploads/Đơn đặt hàng.xlsx`;

            // Save the workbook to a file
            await workbook.xlsx.writeFile(path);
        } else if (query.fileType === 'pdf') {
            const timeAt = new Date(order.time_at);
            const timeAtString = `Ngày ${timeAt.getDate()} tháng ${timeAt.getMonth() + 1} năm ${timeAt.getFullYear()}`;
            path = `uploads/Don_Dat_Hang.pdf`;
            const headerOrderPDF = {
                company: order.organization?.name || '',
                address: order.organization?.address || '',
                contact: `Điện thoại:  ${order.organization?.phone_number || ''}${'  '} – ${'  '} Hotline: ${order.organization?.hotline || ''}`,
                tax_code: order.organization?.tax_code || '',
                time_at: timeAtString,
                partner_name: order.partner?.name || '',
                commission_name: order.partner?.representative_name,
                oAddress: order.address || '',
                commission_account: order.partner?.account_number || '',
                represent: order.partner?.representative_name || '',
                phone_number: order.partner?.representative_phone || '',
                email: order.partner?.representative_email || '',
                note: order.organization?.name || 'Công ty TNHH SX TM Thép Đông Anh',
                logo: order.organization?.logo || '',
            };
            const sum = {
                quantity: this.getTotal(dataBody, 'quantity'),
                total_money: this.getTotal(dataBody, 'total_money'),
                total_money_vat: this.getTotal(dataBody, 'total_money_vat'),
                total_money_all: this.getTotal(dataBody, 'total_money_all'),
                commission_vat: this.getTotal(dataBody, 'commission_vat'),
                commission_money: this.getTotal(dataBody, 'commission_money'),
            };
            const contentHtml = orderPDF(dataBody, headerOrderPDF, sum);
            await this.convertPDF(path, contentHtml);
        }

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
    public async exportExcelImportWarehouse(query: any, userId: number): Promise<string> {
        let path = '';
        if (query.fileType === 'excel') {
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

            path = `uploads/import_warehouse_${query.id}.xlsx`;

            // Save the workbook to a file
            await workbook.xlsx.writeFile(path);
        } else if (query.fileType === 'pdf') {
            path = `uploads/Phieu_Nhap_Kho_${query.id}.pdf`;
            const data = await this.inventoryService.findById(Number(query.id));
            const dataUser = await this.userService.getEmployeeByUser(userId);
            const final_data = { ...data, user: dataUser };
            const contentHtml = importWarehousePDF(final_data);
            await this.convertPDF(path, contentHtml);
        }
        return path;
    }

    // bieu mau hoa hong cho nguoi ban hang
    public async exportExcelSalesCommission(query?: any): Promise<string> {
        let path = '';
        if (query.fileType === 'excel') {
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
                dataFakeCommistion,
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
            path = 'uploads/sales_commission.xlsx';
            await workbook.xlsx.writeFile(path);
        } else if (query.fileType === 'pdf') {
            path = 'uploads/sales_commission.pdf';
            const dataSum = {
                sumPayStart: 0,
                sumPayUp: 0,
                sumPayDowm: 0,
                sumPayEnd: 0,
            };
            const contentHtml = paymentCommissionDPF(query.startAt, query.endAt, dataFakeCommistion, dataSum);
            await this.convertPDF(path, contentHtml);
        }

        return path;
    }

    // bieu mau báo cáo công nợ phải trả
    public async exportExcelPayment(query?: any): Promise<string> {
        if (!query.partnerId) throw new Error('partner_id.not_found');
        const partner = await this.partnerService.findById(Number(query.partnerId));
        const data = await this.partnerService.getDebt({
            ...query,
            startAt: new Date(query.startAt).toISOString(),
            endAt: new Date(query.endAt).toISOString(),
            partnerId: Number(query.partnerId),
        });
        console.log('data', JSON.stringify(data));
        const dataBody = data.details.map((item: any, index: any) => {
            return {
                id: index + 1,
                code: partner?.code,
                partner: partner?.name,
                type: item.order?.type ?? '',
                payStart: data.beginning_debt,
                payUp: item.increase,
                payDown: item.reduction,
                payEnd: item.ending,
                paymentDue: 0,
                payRequest: 0,
                payApproval: '',
            };
        });
        let path = '';
        if (query.fileType == 'excel') {
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
                dataBody,
                [],
            );
            const lastRow = worksheet.rowCount;
            worksheet.getCell('D3').value = query.startAt;
            worksheet.getCell('F3').value = query.endAt;
            worksheet.getCell('E6').value = { formula: `SUM(E7: E${lastRow})` };
            worksheet.getCell('F6').value = { formula: `SUM(F7: F${lastRow})` };
            worksheet.getCell('G6').value = { formula: `SUM(G7: G${lastRow})` };
            worksheet.getCell('H6').value = { formula: `SUM(H7: H${lastRow})` };
            worksheet.getCell('I6').value = { formula: `SUM(I7: I${lastRow})` };
            worksheet.getCell('J6').value = { formula: `SUM(J7: J${lastRow})` };
            path = 'uploads/export_payment.xlsx';
            await workbook.xlsx.writeFile(path);
        } else if (query.fileType == 'pdf') {
            path = 'uploads/export_payment.pdf';
            const dataSum = {
                sumPayStart: data.beginning_debt,
                sumPayUp: data.debt_increase,
                sumPayDown: data.debt_reduction,
                sumPayEnd: data.ending_debt,
            };
            const content = paymentHeaderDPF(query.startAt, query.endAt, dataBody, dataSum);
            await this.convertPDF(path, content);
        }
        return path;
    }
    //biểu mẫu giao dịch
    public async exportExcelTransaction(query?: any): Promise<string> {
        const type = query?.bank;
        let path = '';
        if (query.fileType === 'excel') {
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
            worksheet.getCell(`A${lastRow + 1}:C${lastRow + 1}`).alignment = {
                vertical: 'middle',
                horizontal: 'center',
            };
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
            path = 'uploads/export_transaction.xlsx';
            await workbook.xlsx.writeFile(path);
        } else if (query.fileType === 'pdf') {
            path = 'uploads/export_transaction.pdf';
            const sumData = {
                sumBalance: 650000000,
                sumArise: 350000000,
                sumDebt: 200000000,
            };
            const data = await this;
            const contentHtml = bankPDF(type, dataFakeBank);
            await this.convertPDF(path, contentHtml);
        }

        return path;
    }

    //biểu mẫu giao dịch ngân hàng
    public async exportExcelTransactionBank(query?: any): Promise<string> {
        const type = query?.bank;
        let path = '';
        if (query.fileType === 'excel') {
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
            worksheet.getCell(`A${lastRow + 1}:C${lastRow + 1}`).alignment = {
                vertical: 'middle',
                horizontal: 'center',
            };
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
            path = 'uploads/export_bank.xlsx';
            await workbook.xlsx.writeFile(path);
        } else if (query.fileType === 'pdf') {
            path = 'uploads/export_bank.pdf';
            const sumData = {
                sumBalance: 650000000,
                sumArise: 350000000,
                sumDebt: 200000000,
            };
            const data = await this.transactionService.getAllTransactions(query);
            const contentHtml = bankPDF(data, sumData);
            await this.convertPDF(path, contentHtml);
        }

        return path;
    }
    //biểu mẫu đối chiếu công nợ
    public async exportExcelDebtComparison(query: any, userId: number): Promise<string> {
        let path = '';
        if (query.fileType === 'excel') {
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
            worksheet.mergeCells('A3:J3');
            worksheet.getCell('A3').value = query.commission
                ? 'BIÊN BẢN ĐỐI CHIẾU CÔNG NỢ HOA HỒNG NGƯỜI BÁN'
                : 'BIÊN BẢN ĐỐI CHIẾU CÔNG NỢ';
            worksheet.getCell('A3').font = { bold: true, size: 32 };
            worksheet.getCell('A3').alignment = { vertical: 'middle', horizontal: 'center' };
            worksheet.getCell('I10').value = 'HP123';
            worksheet.mergeCells(`A${lastRow + 1}:D${lastRow + 1}`);
            worksheet.getCell(`A${lastRow + 1}`).value = 'Tổng';
            (worksheet.getCell(`A${lastRow + 1}`).alignment = { vertical: 'middle', horizontal: 'center' }),
                // (worksheet.getCell(`M${lastRow + 1}`).value = 'Tổng');
                // (worksheet.getCell(`M${lastRow + 1}`).alignment = { vertical: 'middle', horizontal: 'center' }),
                (worksheet.getCell(`A${lastRow + 1}`).font = { bold: true, size: 14 });
            // worksheet.getCell(`M${lastRow + 1}`).font = { bold: true, size: 14 };
            worksheet.getCell(`E${lastRow + 1}`).value = { formula: `SUM(E${startRow + 2}: E${lastRow})` };
            worksheet.getCell(`F${lastRow + 1}`).value = { formula: `SUM(F${startRow + 2}: F${lastRow})` };
            worksheet.getCell(`I${lastRow + 1}`).value = { formula: `SUM(I${startRow + 2}: I${lastRow}) + D14` };
            // worksheet.getCell(`L${lastRow + 1}`).value = { formula: `SUM(L${startRow + 2}: L${lastRow}) + G14` };
            // worksheet.getCell(`N${lastRow + 1}`).value = { formula: `SUM(N${startRow + 2}: N${lastRow})` };
            // worksheet.getCell(`O${lastRow + 1}`).value = { formula: `SUM(O${startRow + 2}: O${lastRow})` };
            // worksheet.getCell(`R${lastRow + 1}`).value = { formula: `SUM(R${startRow + 2}: R${lastRow})` };
            // worksheet.getCell(`U${lastRow + 1}`).value = { formula: `SUM(U${startRow + 2}: U${lastRow}) + O14` };
            this.addBorder(worksheet, 1, 11, lastRow + 1);
            worksheet.mergeCells(`A${lastRow + 2}:K${lastRow + 2}`);
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
            path = 'uploads/export_debt_comparison.xlsx';
            await workbook.xlsx.writeFile(path);
        } else if (query.fileType === 'pdf') {
            path = 'uploads/export_debt_comparison.pdf';
            const header = {
                title: query.commission
                    ? 'BIÊN BẢN ĐỐI CHIẾU CÔNG NỢ HOA HỒNG NGƯỜI BÁN'
                    : 'BIÊN BẢN ĐỐI CHIẾU CÔNG NỢ',
            };
            const sumData = {
                sumIntoMoney: 650000000,
                sumMoney: 350000000,
                sumDebt: 200000000,
                sumPayRequest: 10000000,
                // sumCommissionMoney: 2300000000,
                // sumCommissionPay: 50000000,
                // sumCommissionDebt: 50000000,
                // sumCommissionPayRequest: 70000000,
            };
            if (!query.partnerId) {
                throw new Error('partner_id.not_found');
            }
            const data = await this.partnerService.getDebt({ partnerId: query.parterId });
            const dataPartner = await this.partnerService.findById(query.parterId);
            const dataUser = await this.userService.getEmployeeByUser(userId);
            const finalData = { ...data, partner: dataPartner, user: dataUser };
            const contentHtml = debtComparisonPDF(finalData, sumData, header);
            await this.convertPDF(path, contentHtml);
        }
        return path;
    }

    //Biểu mẫu báo giá
    public async exportExcelQuotation(query?: any): Promise<string> {
        let path = '';
        if (query.fileType === 'excel') {
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
            path = 'uploads/export_quotation.xlsx';
            await workbook.xlsx.writeFile(path);
        } else if (query.fileType === 'pdf') {
            const quotation: any = await this.quotationService.findById(Number(query.id));
            if (!quotation) {
                throw new Error('id.not_found');
            }
            const timeAt = new Date(quotation.time_at);
            const timeAtString = `Ngày ${timeAt.getDate()} tháng ${timeAt.getMonth() + 1} năm ${timeAt.getFullYear()}`;
            const headerQuotation = {
                partner: quotation.partner.name,
                address: quotation.partner.address,
                representative_name: quotation.partner.representative_name || '',
                phone: quotation.partner.representative_phone || '',
                email: quotation.partner.representative_email || '',
                time_at: timeAtString,
                note: quotation.note || 'Công ty TNHH SX TM Thép Đông Anh',
            };
            const dataBody = quotation.details.map((item: any, index: any) => {
                return {
                    id: index + 1,
                    product: item.product.name,
                    unit: item.product.unit.name,
                    quantity: item.quantity,
                    price: item.price,
                    intoMoney: Number(item.quantity) * Number(item.price),
                    vat: item.vat || 0,
                    value: (Number(item.quantity) * Number(item.price) * Number(item.vat)) / 100,
                    total: Number(item.quantity) * Number(item.price) * (1 + Number(item.vat)),
                };
            });
            path = 'uploads/Bao_Gia.pdf';
            const sumQuotation = {
                sumQuatity: this.getTotal(dataBody, 'quantity'),
                sumMoney: this.getTotal(dataBody, 'intoMoney'),
                sumVat: this.getTotal(dataBody, 'vat'),
                total: this.getTotal(dataBody, 'total'),
            };
            const contentHtml = quotationPDF(dataBody, sumQuotation, headerQuotation);
            await this.convertPDF(path, contentHtml);
        }
        return path;
    }
}
