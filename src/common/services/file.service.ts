import { renderExcelHeader } from '@common/helpers/excel';
import * as ExcelJS from 'exceljs';
import { importPaymentCustomizeHeader, importPaymentHeader } from '@common/excels/payment';
import { dataFakeBank, importBankCustomizeHeader, importBankHeader } from '@common/excels/bank';
import { importQuotationCustomizeHeader, importQuotationHeader } from '@common/excels/quotation';
import { OrderService } from './order.service';
import { PartnerService } from './partner.service';
import fs from 'fs';
import { paymentHeaderDPF } from '@common/pdfs/payment';
import { bankPDF } from '@common/pdfs/bank';
import { paymentCommissionDPF } from '@common/pdfs/payment-commission';
import { debtComparisonPDF } from '@common/pdfs/debt-comparison';
import { IHeaderQuotationPDF, quotationPDF } from '@common/pdfs/quotation';
import { orderPDF } from '@common/pdfs/order';
import { QuotationService } from './quotation.service';
import { importWarehousePDF } from '@common/pdfs/import-warehouse';
import { UserService } from './user.service';
import { InventoryService } from './inventory.service';
import { TransactionService } from './transaction.service';
import { formatPhoneNumber } from '@common/helpers/formatPhoneNumber';
import logger from '@common/logger';
import { IInventoryPDF } from '@common/interfaces/inventory.interface';
import { exportWarehousePDF } from '@common/pdfs/export-warehouse';
import { FileType, LOGO_LEFT_PATH, LOGO_RIGHT_PATH, PrefixFilePath } from '@config/app.constant';
import { importFinishedPDF } from '@common/pdfs/import-finished';
import { production1PDF } from '@common/pdfs/production-1';
import { production2PDF } from '@common/pdfs/production-2';
import { production3PDF } from '@common/pdfs/production-3';
import { exportMaterialPDF } from '@common/pdfs/export-material';
import {
    importDebtCompartionHeader,
    importDebtCompartionCustomizeHeader,
    dataFakeDebtCompartion,
} from '@common/excels/debt-comparison';
import {
    importWarehouseHeader,
    importWarehouseCustomizeHeader,
    importWarehouseFooter,
} from '@common/excels/import-warehouse';
import {
    purchaseOrderCustomizeHeader,
    purchaseOrderHeader,
    purchaseOrderFooter,
    fakeImportWarehouseData,
} from '@common/excels/purchase-order';
import {
    importSalesCommissionHeader,
    importSalesCommissionCustomizeHeader,
    dataFakeCommission,
} from '@common/excels/sales-commission';
import { PuppeteerAdapter } from '@common/infrastructure/puppeteer.adapter';

export class FileService {
    private static instance: FileService;
    private orderService = OrderService.getInstance();
    private partnerService = PartnerService.getInstance();
    private quotationService = QuotationService.getInstance();
    private userService = UserService.getInstance();
    private inventoryService = InventoryService.getInstance();
    private transactionService = TransactionService.getInstance();
    private puppeteer = PuppeteerAdapter.getInstance();

    private constructor() {}

    public static getInstance(): FileService {
        if (!this.instance) {
            this.instance = new FileService();
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
        // create directory if it does not exist
        const dir = require('path').dirname(pathPDF);
        try {
            await fs.promises.access(dir);
        } catch {
            await fs.promises.mkdir(dir, { recursive: true });
        }
        const browser = await this.puppeteer.getBrowser();
        let page;

        try {
            page = await browser.newPage();

            // Set timeout for page operations
            page.setDefaultNavigationTimeout(30000);

            // Block unnecessary resources to improve performance
            await page.setRequestInterception(true);
            page.on('request', (req: any) => {
                if (['image', 'font', 'media'].includes(req.resourceType())) {
                    req.continue();
                } else {
                    req.continue();
                }
            });

            await page.setContent(contentHtml, { waitUntil: 'domcontentloaded' });
            const pdfBuffer = await page.pdf({
                format: 'A4',
                landscape: false,
                printBackground: true,
                margin: {
                    top: '20px',
                    right: '20px',
                    bottom: '20px',
                    left: '20px',
                },
            });

            await fs.promises.writeFile(pathPDF, pdfBuffer);
        } catch (error) {
            logger.error('Error generating PDF:', error);
            throw error;
        } finally {
            // Always close the page and release browser
            if (page) await page.close().catch((e: any) => logger.error('Error closing page:', e));
            this.puppeteer.releaseBrowser(browser);
        }
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
                total_money_all:
                    item.quantity * Number(item.price) + (item.quantity * Number(item.price) * item.vat) / 100,
                commission_vat: item.commission,
                commission_money: (item.quantity * Number(item.price) * item.commission) / 100,
            };
        });
        if (query.fileType === FileType.EXCEL) {
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
                filename: LOGO_LEFT_PATH,
                extension: 'png',
            });

            worksheet.mergeCells('A2', 'B4');
            worksheet.addImage(logo, 'A2:B4');

            const logo_right = workbook.addImage({
                filename: LOGO_RIGHT_PATH,
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

            path = `${PrefixFilePath}/Đơn đặt hàng.xlsx`;

            // Save the workbook to a file
            await workbook.xlsx.writeFile(path);
        } else if (query.fileType === FileType.PDF) {
            const timeAt = new Date(order.time_at);
            const timeAtString = `Ngày ${timeAt.getDate()} tháng ${timeAt.getMonth() + 1} năm ${timeAt.getFullYear()}`;
            path = `${PrefixFilePath}/Don_Dat_Hang.pdf`;
            const headerOrderPDF = {
                company: order.organization?.name || '',
                address: order.organization?.address || '',
                contact: `Điện thoại:  ${order.organization?.phone_number ? formatPhoneNumber(order.organization?.phone_number) : ''}${'  '} – ${'  '} Hotline: ${order.organization?.hotline ? formatPhoneNumber(order.organization?.hotline) : ''}`,
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
            logger.info('dataBody', JSON.stringify(dataBody));
            await this.convertPDF(path, contentHtml);
        }

        return path;
    }

    // bieu mau hop dong mua hang
    public async exportExcelPurchaseContract(id: number): Promise<string> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        // Save the workbook to a file
        const path = `${PrefixFilePath}/Hợp đồng mua hàng.xlsx`;
        await workbook.xlsx.writeFile(path);

        return path;
    }

    // bieu mau nhap kho vat tu
    public async exportExcelImportWarehouse(query: any, userId: number): Promise<string> {
        let path = '';
        if (query.fileType === FileType.EXCEL) {
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
                filename: LOGO_LEFT_PATH,
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

            path = `${PrefixFilePath}/import_warehouse_${query.id}.xlsx`;

            // Save the workbook to a file
            await workbook.xlsx.writeFile(path);
        } else if (query.fileType === FileType.PDF) {
            path = `${PrefixFilePath}/Phieu_Nhap_Kho_${query.id}.pdf`;
            const data = await this.inventoryService.findById(Number(query.id));
            const dataUser = await this.userService.getEmployeeByUser(userId);
            const final_data = { ...data, user: dataUser };
            const contentHtml = importWarehousePDF(final_data as unknown as IInventoryPDF);
            await this.convertPDF(path, contentHtml);
        }
        return path;
    }

    public async exportExcelImportFinished(query: any, userId: number): Promise<string> {
        let path = '';
        if (query.fileType === FileType.EXCEL) {
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
                filename: LOGO_LEFT_PATH,
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

            path = `${PrefixFilePath}/import_finished_${query.id}.xlsx`;

            // Save the workbook to a file
            await workbook.xlsx.writeFile(path);
        } else if (query.fileType === FileType.PDF) {
            path = `${PrefixFilePath}/Phieu_Nhap_Kho_Thanh_Pham_${query.id}.pdf`;
            const data = await this.inventoryService.findById(Number(query.id));
            const dataUser = await this.userService.getEmployeeByUser(userId);
            const final_data = { ...data, user: dataUser };
            const contentHtml = importFinishedPDF(final_data as unknown as IInventoryPDF);
            await this.convertPDF(path, contentHtml);
        }
        return path;
    }

    public async production1(query: any, userId: number): Promise<string> {
        let path = '';
        if (query.fileType === FileType.EXCEL) {
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
                filename: LOGO_LEFT_PATH,
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

            path = `${PrefixFilePath}/import_finished_${query.id}.xlsx`;

            // Save the workbook to a file
            await workbook.xlsx.writeFile(path);
        } else if (query.fileType === FileType.PDF) {
            path = `${PrefixFilePath}/Lenh_San_Xuat_1_${query.id}.pdf`;
            const data = await this.inventoryService.findById(Number(query.id));
            const dataUser = await this.userService.getEmployeeByUser(userId);
            const final_data = { ...data, user: dataUser };
            const contentHtml = production1PDF(final_data as unknown as IInventoryPDF);
            await this.convertPDF(path, contentHtml);
        }
        return path;
    }

    public async production2(query: any, userId: number): Promise<string> {
        let path = '';
        if (query.fileType === FileType.EXCEL) {
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
                filename: LOGO_LEFT_PATH,
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

            path = `${PrefixFilePath}/production_2_${query.id}.xlsx`;

            // Save the workbook to a file
            await workbook.xlsx.writeFile(path);
        } else if (query.fileType === FileType.PDF) {
            path = `${PrefixFilePath}/Lenh_San_Xuat_2_${query.id}.pdf`;
            const data = await this.inventoryService.findById(Number(query.id));
            const dataUser = await this.userService.getEmployeeByUser(userId);
            const final_data = { ...data, user: dataUser };
            const contentHtml = production2PDF(final_data as unknown as IInventoryPDF);
            await this.convertPDF(path, contentHtml);
        }
        return path;
    }

    public async production3(query: any, userId: number): Promise<string> {
        let path = '';
        if (query.fileType === FileType.EXCEL) {
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
                filename: LOGO_LEFT_PATH,
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

            path = `${PrefixFilePath}/production_3_${query.id}.xlsx`;

            // Save the workbook to a file
            await workbook.xlsx.writeFile(path);
        } else if (query.fileType === FileType.PDF) {
            path = `${PrefixFilePath}/Lenh_San_Xuat_3_${query.id}.pdf`;
            const data = await this.inventoryService.findById(Number(query.id));
            const dataUser = await this.userService.getEmployeeByUser(userId);
            const final_data = { ...data, user: dataUser };
            const contentHtml = production3PDF(final_data as unknown as IInventoryPDF);
            await this.convertPDF(path, contentHtml);
        }
        return path;
    }

    public async exportExcelExportMaterial(query: any, userId: number): Promise<string> {
        let path = '';
        if (query.fileType === FileType.EXCEL) {
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
                filename: LOGO_LEFT_PATH,
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

            path = `${PrefixFilePath}/export_material_${query.id}.xlsx`;

            // Save the workbook to a file
            await workbook.xlsx.writeFile(path);
        } else if (query.fileType === FileType.PDF) {
            path = `${PrefixFilePath}/Phieu_Xuat_Nguyen_Vat_Lieu_${query.id}.pdf`;
            const data = await this.inventoryService.findById(Number(query.id));
            const dataUser = await this.userService.getEmployeeByUser(userId);
            const final_data = { ...data, user: dataUser };
            const contentHtml = exportMaterialPDF(final_data as unknown as IInventoryPDF);
            await this.convertPDF(path, contentHtml);
        }
        return path;
    }

    public async exportExcelExportWarehouse(query: any, userId: number): Promise<string> {
        let path = '';
        if (query.fileType === FileType.EXCEL) {
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
                filename: LOGO_LEFT_PATH,
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

            path = `${PrefixFilePath}/export_warehouse_${query.id}.xlsx`;

            // Save the workbook to a file
            await workbook.xlsx.writeFile(path);
        } else if (query.fileType === FileType.PDF) {
            path = `${PrefixFilePath}/Phieu_Xuat_Kho_${query.id}.pdf`;
            const data = await this.inventoryService.findById(Number(query.id));
            const dataUser = await this.userService.getEmployeeByUser(userId);
            const final_data = { ...data, user: dataUser };
            const contentHtml = exportWarehousePDF(final_data as unknown as IInventoryPDF);
            await this.convertPDF(path, contentHtml);
        }
        return path;
    }

    // bieu mau hoa hong cho nguoi ban hang
    public async exportExcelSalesCommission(query?: any): Promise<string> {
        let path = '';
        if (query.fileType === FileType.EXCEL) {
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
                dataFakeCommission,
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
            path = `${PrefixFilePath}/sales_commission.xlsx`;
            await workbook.xlsx.writeFile(path);
        } else if (query.fileType === FileType.PDF) {
            path = `${PrefixFilePath}/sales_commission.pdf`;
            const dataSum = {
                sumPayStart: 0,
                sumPayUp: 0,
                sumPayDowm: 0,
                sumPayEnd: 0,
            };
            const contentHtml = paymentCommissionDPF(query.startAt, query.endAt, dataFakeCommission, dataSum);
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
        if (query.fileType === FileType.EXCEL) {
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
            path = `${PrefixFilePath}/export_payment.xlsx`;
            await workbook.xlsx.writeFile(path);
        } else if (query.fileType == FileType.PDF) {
            path = `${PrefixFilePath}/export_payment.pdf`;
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
        if (query.fileType === FileType.EXCEL) {
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
            path = `${PrefixFilePath}/export_transaction.xlsx`;
            await workbook.xlsx.writeFile(path);
        } else if (query.fileType === FileType.PDF) {
            path = `${PrefixFilePath}/export_transaction.pdf`;
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
        if (query.fileType === FileType.EXCEL) {
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
            path = `${PrefixFilePath}/export_bank.xlsx`;
            await workbook.xlsx.writeFile(path);
        } else if (query.fileType === FileType.PDF) {
            path = `${PrefixFilePath}/export_bank.pdf`;
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
        if (query.fileType === FileType.EXCEL) {
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
            path = `${PrefixFilePath}/export_debt_comparison.xlsx`;
            await workbook.xlsx.writeFile(path);
        } else if (query.fileType === FileType.PDF) {
            path = `${PrefixFilePath}/export_debt_comparison.pdf`;
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
            if (!query.id) {
                throw new Error('partner_id.not_found');
            }
            const data = await this.partnerService.getDebt({ partnerId: Number(query.id) });
            const dataPartner = await this.partnerService.findById(Number(query.id));
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
        if (query.fileType === FileType.EXCEL) {
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
            path = `${PrefixFilePath}/export_quotation.xlsx`;
            await workbook.xlsx.writeFile(path);
        } else if (query.fileType === FileType.PDF) {
            const quotation: any = await this.quotationService.findById(Number(query.id));
            if (!quotation) {
                throw new Error('id.not_found');
            }
            const timeAt = new Date(quotation.time_at);
            const timeAtString = `Ngày ${timeAt.getDate()} tháng ${timeAt.getMonth() + 1} năm ${timeAt.getFullYear()}`;
            const headerQuotation: IHeaderQuotationPDF = {
                organization: quotation.organization,
                partner: quotation.partner,
                timeAt: timeAtString,
            };
            quotation.details = quotation.details.map((item: any, index: any) => {
                const total_vat = (Number(item.quantity) * Number(item.price) * (Number(item.vat) || 0)) / 100;
                return {
                    index: index + 1,
                    ...item,
                    intoMoney: Number(item.quantity) * Number(item.price),
                    vat: item.vat || 0,
                    total_vat,
                    value: (Number(item.quantity) * Number(item.price) * Number(item.vat)) / 100,
                    total: Number(item.quantity) * Number(item.price) * (1 + Number(item.vat)),
                };
            });
            path = `${PrefixFilePath}/Bao_Gia.pdf`;
            const sumQuotation = {
                sumQuantity: this.getTotal(quotation.details, 'quantity'),
                sumMoney: this.getTotal(quotation.details, 'intoMoney'),
                sumVat: this.getTotal(quotation.details, 'total_vat'),
                total: this.getTotal(quotation.details, 'total'),
            };
            const contentHtml = quotationPDF(quotation, sumQuotation, headerQuotation);
            await this.convertPDF(path, contentHtml);
        }
        return path;
    }
}
