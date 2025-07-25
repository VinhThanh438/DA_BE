"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileService = void 0;
const excel_1 = require("../helpers/excel");
const ExcelJS = __importStar(require("exceljs"));
const payment_1 = require("../excels/payment");
const bank_1 = require("../excels/bank");
const quotation_1 = require("../excels/quotation");
const order_service_1 = require("./order.service");
const partner_service_1 = require("./partner.service");
const fs_1 = __importDefault(require("fs"));
const payment_2 = require("../pdfs/payment");
const bank_2 = require("../pdfs/bank");
const payment_commission_1 = require("../pdfs/payment-commission");
const debt_comparison_1 = require("../pdfs/debt-comparison");
const quotation_2 = require("../pdfs/quotation");
const order_1 = require("../pdfs/order");
const quotation_service_1 = require("./quotation.service");
const import_warehouse_1 = require("../pdfs/import-warehouse");
const user_service_1 = require("./user.service");
const inventory_service_1 = require("./inventory.service");
const transaction_service_1 = require("./transaction.service");
const formatPhoneNumber_1 = require("../helpers/formatPhoneNumber");
const logger_1 = __importDefault(require("../logger"));
const export_warehouse_1 = require("../pdfs/export-warehouse");
const app_constant_1 = require("../../config/app.constant");
const import_finished_1 = require("../pdfs/import-finished");
const production_1_1 = require("../pdfs/production-1");
const production_2_1 = require("../pdfs/production-2");
const production_3_1 = require("../pdfs/production-3");
const export_material_1 = require("../pdfs/export-material");
const debt_comparison_2 = require("../excels/debt-comparison");
const import_warehouse_2 = require("../excels/import-warehouse");
const purchase_order_1 = require("../excels/purchase-order");
const sales_commission_1 = require("../excels/sales-commission");
const puppeteer_adapter_1 = require("../infrastructure/puppeteer.adapter");
class FileService {
    constructor() {
        this.orderService = order_service_1.OrderService.getInstance();
        this.partnerService = partner_service_1.PartnerService.getInstance();
        this.quotationService = quotation_service_1.QuotationService.getInstance();
        this.userService = user_service_1.UserService.getInstance();
        this.inventoryService = inventory_service_1.InventoryService.getInstance();
        this.transactionService = transaction_service_1.TransactionService.getInstance();
        this.puppeteer = puppeteer_adapter_1.PuppeteerAdapter.getInstance();
        this.getTotal = (data, key) => {
            return data.reduce((sum, obj) => sum + (obj[key] || 0), 0);
        };
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new FileService();
        }
        return this.instance;
    }
    addBorder(worksheet, startCol, endCol, row) {
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
    convertPDF(pathPDF, contentHtml) {
        return __awaiter(this, void 0, void 0, function* () {
            // create directory if it does not exist
            const dir = require('path').dirname(pathPDF);
            try {
                yield fs_1.default.promises.access(dir);
            }
            catch (_a) {
                yield fs_1.default.promises.mkdir(dir, { recursive: true });
            }
            const browser = yield this.puppeteer.getBrowser();
            let page;
            try {
                page = yield browser.newPage();
                // Set timeout for page operations
                page.setDefaultNavigationTimeout(30000);
                // Block unnecessary resources to improve performance
                yield page.setRequestInterception(true);
                page.on('request', (req) => {
                    if (['image', 'font', 'media'].includes(req.resourceType())) {
                        req.continue();
                    }
                    else {
                        req.continue();
                    }
                });
                yield page.setContent(contentHtml, { waitUntil: 'domcontentloaded' });
                const pdfBuffer = yield page.pdf({
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
                yield fs_1.default.promises.writeFile(pathPDF, pdfBuffer);
            }
            catch (error) {
                logger_1.default.error('Error generating PDF:', error);
                throw error;
            }
            finally {
                // Always close the page and release browser
                if (page)
                    yield page.close().catch((e) => logger_1.default.error('Error closing page:', e));
                this.puppeteer.releaseBrowser(browser);
            }
        });
    }
    // bieu mau don dat hang
    exportExcelPurchaseOrder(query) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
            let path = '';
            // lay du lieu don hang
            const order = (yield this.orderService.findById(Number(query.id)));
            if (!order) {
                throw new Error('id.not_found');
            }
            const dataBody = order.details.map((item, index) => {
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
                    total_money_all: item.quantity * Number(item.price) + (item.quantity * Number(item.price) * item.vat) / 100,
                    commission_vat: item.commission,
                    commission_money: (item.quantity * Number(item.price) * item.commission) / 100,
                };
            });
            if (query.fileType === app_constant_1.FileType.EXCEL) {
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
                    filename: app_constant_1.LOGO_LEFT_PATH,
                    extension: 'png',
                });
                worksheet.mergeCells('A2', 'B4');
                worksheet.addImage(logo, 'A2:B4');
                const logo_right = workbook.addImage({
                    filename: app_constant_1.LOGO_RIGHT_PATH,
                    extension: 'png',
                });
                worksheet.mergeCells('H2', 'I4');
                worksheet.addImage(logo_right, 'H2:I4');
                const startRow = 12;
                const startColumn = 1;
                const customizeHeader = purchase_order_1.purchaseOrderCustomizeHeader.map((item) => {
                    switch (item.key) {
                        case 'company_name':
                            return Object.assign(Object.assign({}, item), { value: order.organization.name || '' });
                        case 'address':
                            return Object.assign(Object.assign({}, item), { value: order.organization.address || '' });
                        case 'contact':
                            return Object.assign(Object.assign({}, item), { value: `Điện thoại:  ${order.organization.phone_number || ''} – Hotline: ${order.organization.hotline || ''}` });
                        case 'tax_code':
                            return Object.assign(Object.assign({}, item), { value: ` MST: ${order.organization.tax_code || ''}` });
                        case 'time_at':
                            const timeAt = new Date(order.time_at);
                            const timeAtString = `Ngày ${timeAt.getDate()} tháng ${timeAt.getMonth() + 1} năm ${timeAt.getFullYear()}`;
                            return Object.assign(Object.assign({}, item), { value: timeAtString });
                        case 'partner_name':
                            return Object.assign(Object.assign({}, item), { value: order.partner.name || '' });
                        case 'commission_name':
                            return Object.assign(Object.assign({}, item), { value: order.partner.representative_name || '' });
                        case 'address':
                            return Object.assign(Object.assign({}, item), { value: order.address || '' });
                        case 'commission_account':
                            return Object.assign(Object.assign({}, item), { value: order.partner.account_number || '' });
                        case 'represent':
                            return Object.assign(Object.assign({}, item), { value: order.partner.representative_name || '' });
                        case 'phone_number':
                            return Object.assign(Object.assign({}, item), { value: `ĐT: ${order.partner.representative_phone || ''}` });
                        case 'email':
                            return Object.assign(Object.assign({}, item), { value: `Email: ${order.partner.representative_email || ''}` });
                        case 'note':
                            return Object.assign(Object.assign({}, item), { value: `Căn cứ vào báo giá số………...., ${order.organization.name || 'Công ty TNHH SX TM Thép Đông Anh'} gửi đến quý công ty đơn hàng với nội dung sau:` });
                        default:
                            return item;
                    }
                });
                (0, excel_1.renderExcelHeader)(worksheet, purchase_order_1.purchaseOrderHeader, startRow, startColumn, customizeHeader, dataBody, purchase_order_1.purchaseOrderFooter);
                path = `${app_constant_1.PrefixFilePath}/Đơn đặt hàng.xlsx`;
                // Save the workbook to a file
                yield workbook.xlsx.writeFile(path);
            }
            else if (query.fileType === app_constant_1.FileType.PDF) {
                const timeAt = new Date(order.time_at);
                const timeAtString = `Ngày ${timeAt.getDate()} tháng ${timeAt.getMonth() + 1} năm ${timeAt.getFullYear()}`;
                path = `${app_constant_1.PrefixFilePath}/Don_Dat_Hang.pdf`;
                const headerOrderPDF = {
                    company: ((_a = order.organization) === null || _a === void 0 ? void 0 : _a.name) || '',
                    address: ((_b = order.organization) === null || _b === void 0 ? void 0 : _b.address) || '',
                    contact: `Điện thoại:  ${((_c = order.organization) === null || _c === void 0 ? void 0 : _c.phone_number) ? (0, formatPhoneNumber_1.formatPhoneNumber)((_d = order.organization) === null || _d === void 0 ? void 0 : _d.phone_number) : ''}${'  '} – ${'  '} Hotline: ${((_e = order.organization) === null || _e === void 0 ? void 0 : _e.hotline) ? (0, formatPhoneNumber_1.formatPhoneNumber)((_f = order.organization) === null || _f === void 0 ? void 0 : _f.hotline) : ''}`,
                    tax_code: ((_g = order.organization) === null || _g === void 0 ? void 0 : _g.tax_code) || '',
                    time_at: timeAtString,
                    partner_name: ((_h = order.partner) === null || _h === void 0 ? void 0 : _h.name) || '',
                    commission_name: (_j = order.partner) === null || _j === void 0 ? void 0 : _j.representative_name,
                    oAddress: order.address || '',
                    commission_account: ((_k = order.partner) === null || _k === void 0 ? void 0 : _k.account_number) || '',
                    represent: ((_l = order.partner) === null || _l === void 0 ? void 0 : _l.representative_name) || '',
                    phone_number: ((_m = order.partner) === null || _m === void 0 ? void 0 : _m.representative_phone) || '',
                    email: ((_o = order.partner) === null || _o === void 0 ? void 0 : _o.representative_email) || '',
                    note: ((_p = order.organization) === null || _p === void 0 ? void 0 : _p.name) || 'Công ty TNHH SX TM Thép Đông Anh',
                    logo: ((_q = order.organization) === null || _q === void 0 ? void 0 : _q.logo) || '',
                };
                const sum = {
                    quantity: this.getTotal(dataBody, 'quantity'),
                    total_money: this.getTotal(dataBody, 'total_money'),
                    total_money_vat: this.getTotal(dataBody, 'total_money_vat'),
                    total_money_all: this.getTotal(dataBody, 'total_money_all'),
                    commission_vat: this.getTotal(dataBody, 'commission_vat'),
                    commission_money: this.getTotal(dataBody, 'commission_money'),
                };
                const contentHtml = (0, order_1.orderPDF)(dataBody, headerOrderPDF, sum);
                logger_1.default.info('dataBody', JSON.stringify(dataBody));
                yield this.convertPDF(path, contentHtml);
            }
            return path;
        });
    }
    // bieu mau hop dong mua hang
    exportExcelPurchaseContract(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Data');
            // Save the workbook to a file
            const path = `${app_constant_1.PrefixFilePath}/Hợp đồng mua hàng.xlsx`;
            yield workbook.xlsx.writeFile(path);
            return path;
        });
    }
    // bieu mau nhap kho vat tu
    exportExcelImportWarehouse(query, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            let path = '';
            if (query.fileType === app_constant_1.FileType.EXCEL) {
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
                    filename: app_constant_1.LOGO_LEFT_PATH,
                    extension: 'png',
                });
                worksheet.mergeCells('A1', 'B4');
                worksheet.addImage(logo, 'A1:B4');
                const startRow = 15;
                const startColumn = 1;
                (0, excel_1.renderExcelHeader)(worksheet, import_warehouse_2.importWarehouseHeader, startRow, startColumn, import_warehouse_2.importWarehouseCustomizeHeader, purchase_order_1.fakeImportWarehouseData, import_warehouse_2.importWarehouseFooter);
                path = `${app_constant_1.PrefixFilePath}/import_warehouse_${query.id}.xlsx`;
                // Save the workbook to a file
                yield workbook.xlsx.writeFile(path);
            }
            else if (query.fileType === app_constant_1.FileType.PDF) {
                path = `${app_constant_1.PrefixFilePath}/Phieu_Nhap_Kho_${query.id}.pdf`;
                const data = yield this.inventoryService.findById(Number(query.id));
                const dataUser = yield this.userService.getEmployeeByUser(userId);
                const final_data = Object.assign(Object.assign({}, data), { user: dataUser });
                const contentHtml = (0, import_warehouse_1.importWarehousePDF)(final_data);
                yield this.convertPDF(path, contentHtml);
            }
            return path;
        });
    }
    exportExcelImportFinished(query, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            let path = '';
            if (query.fileType === app_constant_1.FileType.EXCEL) {
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
                    filename: app_constant_1.LOGO_LEFT_PATH,
                    extension: 'png',
                });
                worksheet.mergeCells('A1', 'B4');
                worksheet.addImage(logo, 'A1:B4');
                const startRow = 15;
                const startColumn = 1;
                (0, excel_1.renderExcelHeader)(worksheet, import_warehouse_2.importWarehouseHeader, startRow, startColumn, import_warehouse_2.importWarehouseCustomizeHeader, purchase_order_1.fakeImportWarehouseData, import_warehouse_2.importWarehouseFooter);
                path = `${app_constant_1.PrefixFilePath}/import_finished_${query.id}.xlsx`;
                // Save the workbook to a file
                yield workbook.xlsx.writeFile(path);
            }
            else if (query.fileType === app_constant_1.FileType.PDF) {
                path = `${app_constant_1.PrefixFilePath}/Phieu_Nhap_Kho_Thanh_Pham_${query.id}.pdf`;
                const data = yield this.inventoryService.findById(Number(query.id));
                const dataUser = yield this.userService.getEmployeeByUser(userId);
                const final_data = Object.assign(Object.assign({}, data), { user: dataUser });
                const contentHtml = (0, import_finished_1.importFinishedPDF)(final_data);
                yield this.convertPDF(path, contentHtml);
            }
            return path;
        });
    }
    production1(query, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            let path = '';
            if (query.fileType === app_constant_1.FileType.EXCEL) {
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
                    filename: app_constant_1.LOGO_LEFT_PATH,
                    extension: 'png',
                });
                worksheet.mergeCells('A1', 'B4');
                worksheet.addImage(logo, 'A1:B4');
                const startRow = 15;
                const startColumn = 1;
                (0, excel_1.renderExcelHeader)(worksheet, import_warehouse_2.importWarehouseHeader, startRow, startColumn, import_warehouse_2.importWarehouseCustomizeHeader, purchase_order_1.fakeImportWarehouseData, import_warehouse_2.importWarehouseFooter);
                path = `${app_constant_1.PrefixFilePath}/import_finished_${query.id}.xlsx`;
                // Save the workbook to a file
                yield workbook.xlsx.writeFile(path);
            }
            else if (query.fileType === app_constant_1.FileType.PDF) {
                path = `${app_constant_1.PrefixFilePath}/Lenh_San_Xuat_1_${query.id}.pdf`;
                const data = yield this.inventoryService.findById(Number(query.id));
                const dataUser = yield this.userService.getEmployeeByUser(userId);
                const final_data = Object.assign(Object.assign({}, data), { user: dataUser });
                const contentHtml = (0, production_1_1.production1PDF)(final_data);
                yield this.convertPDF(path, contentHtml);
            }
            return path;
        });
    }
    production2(query, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            let path = '';
            if (query.fileType === app_constant_1.FileType.EXCEL) {
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
                    filename: app_constant_1.LOGO_LEFT_PATH,
                    extension: 'png',
                });
                worksheet.mergeCells('A1', 'B4');
                worksheet.addImage(logo, 'A1:B4');
                const startRow = 15;
                const startColumn = 1;
                (0, excel_1.renderExcelHeader)(worksheet, import_warehouse_2.importWarehouseHeader, startRow, startColumn, import_warehouse_2.importWarehouseCustomizeHeader, purchase_order_1.fakeImportWarehouseData, import_warehouse_2.importWarehouseFooter);
                path = `${app_constant_1.PrefixFilePath}/production_2_${query.id}.xlsx`;
                // Save the workbook to a file
                yield workbook.xlsx.writeFile(path);
            }
            else if (query.fileType === app_constant_1.FileType.PDF) {
                path = `${app_constant_1.PrefixFilePath}/Lenh_San_Xuat_2_${query.id}.pdf`;
                const data = yield this.inventoryService.findById(Number(query.id));
                const dataUser = yield this.userService.getEmployeeByUser(userId);
                const final_data = Object.assign(Object.assign({}, data), { user: dataUser });
                const contentHtml = (0, production_2_1.production2PDF)(final_data);
                yield this.convertPDF(path, contentHtml);
            }
            return path;
        });
    }
    production3(query, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            let path = '';
            if (query.fileType === app_constant_1.FileType.EXCEL) {
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
                    filename: app_constant_1.LOGO_LEFT_PATH,
                    extension: 'png',
                });
                worksheet.mergeCells('A1', 'B4');
                worksheet.addImage(logo, 'A1:B4');
                const startRow = 15;
                const startColumn = 1;
                (0, excel_1.renderExcelHeader)(worksheet, import_warehouse_2.importWarehouseHeader, startRow, startColumn, import_warehouse_2.importWarehouseCustomizeHeader, purchase_order_1.fakeImportWarehouseData, import_warehouse_2.importWarehouseFooter);
                path = `${app_constant_1.PrefixFilePath}/production_3_${query.id}.xlsx`;
                // Save the workbook to a file
                yield workbook.xlsx.writeFile(path);
            }
            else if (query.fileType === app_constant_1.FileType.PDF) {
                path = `${app_constant_1.PrefixFilePath}/Lenh_San_Xuat_3_${query.id}.pdf`;
                const data = yield this.inventoryService.findById(Number(query.id));
                const dataUser = yield this.userService.getEmployeeByUser(userId);
                const final_data = Object.assign(Object.assign({}, data), { user: dataUser });
                const contentHtml = (0, production_3_1.production3PDF)(final_data);
                yield this.convertPDF(path, contentHtml);
            }
            return path;
        });
    }
    exportExcelExportMaterial(query, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            let path = '';
            if (query.fileType === app_constant_1.FileType.EXCEL) {
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
                    filename: app_constant_1.LOGO_LEFT_PATH,
                    extension: 'png',
                });
                worksheet.mergeCells('A1', 'B4');
                worksheet.addImage(logo, 'A1:B4');
                const startRow = 15;
                const startColumn = 1;
                (0, excel_1.renderExcelHeader)(worksheet, import_warehouse_2.importWarehouseHeader, startRow, startColumn, import_warehouse_2.importWarehouseCustomizeHeader, purchase_order_1.fakeImportWarehouseData, import_warehouse_2.importWarehouseFooter);
                path = `${app_constant_1.PrefixFilePath}/export_material_${query.id}.xlsx`;
                // Save the workbook to a file
                yield workbook.xlsx.writeFile(path);
            }
            else if (query.fileType === app_constant_1.FileType.PDF) {
                path = `${app_constant_1.PrefixFilePath}/Phieu_Xuat_Nguyen_Vat_Lieu_${query.id}.pdf`;
                const data = yield this.inventoryService.findById(Number(query.id));
                const dataUser = yield this.userService.getEmployeeByUser(userId);
                const final_data = Object.assign(Object.assign({}, data), { user: dataUser });
                const contentHtml = (0, export_material_1.exportMaterialPDF)(final_data);
                yield this.convertPDF(path, contentHtml);
            }
            return path;
        });
    }
    exportExcelExportWarehouse(query, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            let path = '';
            if (query.fileType === app_constant_1.FileType.EXCEL) {
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
                    filename: app_constant_1.LOGO_LEFT_PATH,
                    extension: 'png',
                });
                worksheet.mergeCells('A1', 'B4');
                worksheet.addImage(logo, 'A1:B4');
                const startRow = 15;
                const startColumn = 1;
                (0, excel_1.renderExcelHeader)(worksheet, import_warehouse_2.importWarehouseHeader, startRow, startColumn, import_warehouse_2.importWarehouseCustomizeHeader, purchase_order_1.fakeImportWarehouseData, import_warehouse_2.importWarehouseFooter);
                path = `${app_constant_1.PrefixFilePath}/export_warehouse_${query.id}.xlsx`;
                // Save the workbook to a file
                yield workbook.xlsx.writeFile(path);
            }
            else if (query.fileType === app_constant_1.FileType.PDF) {
                path = `${app_constant_1.PrefixFilePath}/Phieu_Xuat_Kho_${query.id}.pdf`;
                const data = yield this.inventoryService.findById(Number(query.id));
                const dataUser = yield this.userService.getEmployeeByUser(userId);
                const final_data = Object.assign(Object.assign({}, data), { user: dataUser });
                const contentHtml = (0, export_warehouse_1.exportWarehousePDF)(final_data);
                yield this.convertPDF(path, contentHtml);
            }
            return path;
        });
    }
    // bieu mau hoa hong cho nguoi ban hang
    exportExcelSalesCommission(query) {
        return __awaiter(this, void 0, void 0, function* () {
            let path = '';
            if (query.fileType === app_constant_1.FileType.EXCEL) {
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Data');
                const startRow = 5;
                const startColumn = 1;
                (0, excel_1.renderExcelHeader)(worksheet, sales_commission_1.importSalesCommissionHeader, startRow, startColumn, sales_commission_1.importSalesCommissionCustomizeHeader, sales_commission_1.dataFakeCommission, []);
                const lastRow = worksheet.rowCount;
                worksheet.getCell('D3').value = query.startDate;
                worksheet.getCell('F3').value = query.endDate;
                worksheet.getCell('E6').value = { formula: `SUM(E7: E${lastRow})` };
                worksheet.getCell('F6').value = { formula: `SUM(F7: F${lastRow})` };
                worksheet.getCell('G6').value = { formula: `SUM(G7: G${lastRow})` };
                worksheet.getCell('H6').value = { formula: `SUM(H7: H${lastRow})` };
                worksheet.getCell('J6').value = { formula: `SUM(J7: J${lastRow})` };
                path = `${app_constant_1.PrefixFilePath}/sales_commission.xlsx`;
                yield workbook.xlsx.writeFile(path);
            }
            else if (query.fileType === app_constant_1.FileType.PDF) {
                path = `${app_constant_1.PrefixFilePath}/sales_commission.pdf`;
                const dataSum = {
                    sumPayStart: 0,
                    sumPayUp: 0,
                    sumPayDowm: 0,
                    sumPayEnd: 0,
                };
                const contentHtml = (0, payment_commission_1.paymentCommissionDPF)(query.startAt, query.endAt, sales_commission_1.dataFakeCommission, dataSum);
                yield this.convertPDF(path, contentHtml);
            }
            return path;
        });
    }
    // bieu mau báo cáo công nợ phải trả
    exportExcelPayment(query) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!query.partnerId)
                throw new Error('partner_id.not_found');
            const partner = yield this.partnerService.findById(Number(query.partnerId));
            const data = yield this.partnerService.getDebt(Object.assign(Object.assign({}, query), { startAt: new Date(query.startAt).toISOString(), endAt: new Date(query.endAt).toISOString(), partnerId: Number(query.partnerId) }));
            const dataBody = data.details.map((item, index) => {
                var _a, _b;
                return {
                    id: index + 1,
                    code: partner === null || partner === void 0 ? void 0 : partner.code,
                    partner: partner === null || partner === void 0 ? void 0 : partner.name,
                    type: (_b = (_a = item.order) === null || _a === void 0 ? void 0 : _a.type) !== null && _b !== void 0 ? _b : '',
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
            if (query.fileType === app_constant_1.FileType.EXCEL) {
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Data');
                const startRow = 5;
                const startColumn = 1;
                (0, excel_1.renderExcelHeader)(worksheet, payment_1.importPaymentHeader, startRow, startColumn, payment_1.importPaymentCustomizeHeader, dataBody, []);
                const lastRow = worksheet.rowCount;
                worksheet.getCell('D3').value = query.startAt;
                worksheet.getCell('F3').value = query.endAt;
                worksheet.getCell('E6').value = { formula: `SUM(E7: E${lastRow})` };
                worksheet.getCell('F6').value = { formula: `SUM(F7: F${lastRow})` };
                worksheet.getCell('G6').value = { formula: `SUM(G7: G${lastRow})` };
                worksheet.getCell('H6').value = { formula: `SUM(H7: H${lastRow})` };
                worksheet.getCell('I6').value = { formula: `SUM(I7: I${lastRow})` };
                worksheet.getCell('J6').value = { formula: `SUM(J7: J${lastRow})` };
                path = `${app_constant_1.PrefixFilePath}/export_payment.xlsx`;
                yield workbook.xlsx.writeFile(path);
            }
            else if (query.fileType == app_constant_1.FileType.PDF) {
                path = `${app_constant_1.PrefixFilePath}/export_payment.pdf`;
                const dataSum = {
                    sumPayStart: data.beginning_debt,
                    sumPayUp: data.debt_increase,
                    sumPayDown: data.debt_reduction,
                    sumPayEnd: data.ending_debt,
                };
                const content = (0, payment_2.paymentHeaderDPF)(query.startAt, query.endAt, dataBody, dataSum);
                yield this.convertPDF(path, content);
            }
            return path;
        });
    }
    //biểu mẫu giao dịch
    exportExcelTransaction(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const type = query === null || query === void 0 ? void 0 : query.bank;
            let path = '';
            if (query.fileType === app_constant_1.FileType.EXCEL) {
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Data');
                const startRow = 5;
                const startColumn = 1;
                (0, excel_1.renderExcelHeader)(worksheet, bank_1.importBankHeader, startRow, startColumn, bank_1.importBankCustomizeHeader, bank_1.dataFakeBank, []);
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
                path = `${app_constant_1.PrefixFilePath}/export_transaction.xlsx`;
                yield workbook.xlsx.writeFile(path);
            }
            else if (query.fileType === app_constant_1.FileType.PDF) {
                path = `${app_constant_1.PrefixFilePath}/export_transaction.pdf`;
                const sumData = {
                    sumBalance: 650000000,
                    sumArise: 350000000,
                    sumDebt: 200000000,
                };
                const data = yield this;
                const contentHtml = (0, bank_2.bankPDF)(type, bank_1.dataFakeBank);
                yield this.convertPDF(path, contentHtml);
            }
            return path;
        });
    }
    //biểu mẫu giao dịch ngân hàng
    exportExcelTransactionBank(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const type = query === null || query === void 0 ? void 0 : query.bank;
            let path = '';
            if (query.fileType === app_constant_1.FileType.EXCEL) {
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Data');
                const startRow = 5;
                const startColumn = 1;
                (0, excel_1.renderExcelHeader)(worksheet, bank_1.importBankHeader, startRow, startColumn, bank_1.importBankCustomizeHeader, bank_1.dataFakeBank, []);
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
                path = `${app_constant_1.PrefixFilePath}/export_bank.xlsx`;
                yield workbook.xlsx.writeFile(path);
            }
            else if (query.fileType === app_constant_1.FileType.PDF) {
                path = `${app_constant_1.PrefixFilePath}/export_bank.pdf`;
                const sumData = {
                    sumBalance: 650000000,
                    sumArise: 350000000,
                    sumDebt: 200000000,
                };
                const data = yield this.transactionService.getAllTransactions(query);
                const contentHtml = (0, bank_2.bankPDF)(data, sumData);
                yield this.convertPDF(path, contentHtml);
            }
            return path;
        });
    }
    //biểu mẫu đối chiếu công nợ
    exportExcelDebtComparison(query, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            let path = '';
            if (query.fileType === app_constant_1.FileType.EXCEL) {
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Data');
                const startRow = 17;
                const startColumn = 1;
                (0, excel_1.renderExcelHeader)(worksheet, debt_comparison_2.importDebtCompartionHeader, startRow, startColumn, debt_comparison_2.importDebtCompartionCustomizeHeader, debt_comparison_2.dataFakeDebtCompartion, []);
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
                path = `${app_constant_1.PrefixFilePath}/export_debt_comparison.xlsx`;
                yield workbook.xlsx.writeFile(path);
            }
            else if (query.fileType === app_constant_1.FileType.PDF) {
                path = `${app_constant_1.PrefixFilePath}/export_debt_comparison.pdf`;
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
                const data = yield this.partnerService.getDebt({ partnerId: Number(query.id) });
                const dataPartner = yield this.partnerService.findById(Number(query.id));
                const dataUser = yield this.userService.getEmployeeByUser(userId);
                const finalData = Object.assign(Object.assign({}, data), { partner: dataPartner, user: dataUser });
                const contentHtml = (0, debt_comparison_1.debtComparisonPDF)(finalData, sumData, header);
                yield this.convertPDF(path, contentHtml);
            }
            return path;
        });
    }
    //Biểu mẫu báo giá
    exportExcelQuotation(query) {
        return __awaiter(this, void 0, void 0, function* () {
            let path = '';
            if (query.fileType === app_constant_1.FileType.EXCEL) {
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Data');
                const startRow = 12;
                const startColumn = 1;
                (0, excel_1.renderExcelHeader)(worksheet, quotation_1.importQuotationHeader, startRow, startColumn, quotation_1.importQuotationCustomizeHeader, [], []);
                path = `${app_constant_1.PrefixFilePath}/export_quotation.xlsx`;
                yield workbook.xlsx.writeFile(path);
            }
            else if (query.fileType === app_constant_1.FileType.PDF) {
                const quotation = yield this.quotationService.findById(Number(query.id));
                if (!quotation) {
                    throw new Error('id.not_found');
                }
                const timeAt = new Date(quotation.time_at);
                const timeAtString = `Ngày ${timeAt.getDate()} tháng ${timeAt.getMonth() + 1} năm ${timeAt.getFullYear()}`;
                const headerQuotation = {
                    organization: quotation.organization,
                    partner: quotation.partner,
                    timeAt: timeAtString,
                };
                quotation.details = quotation.details.map((item, index) => {
                    const total_vat = (Number(item.quantity) * Number(item.price) * (Number(item.vat) || 0)) / 100;
                    return Object.assign(Object.assign({ index: index + 1 }, item), { intoMoney: Number(item.quantity) * Number(item.price), vat: item.vat || 0, total_vat, value: (Number(item.quantity) * Number(item.price) * Number(item.vat)) / 100, total: Number(item.quantity) * Number(item.price) * (1 + Number(item.vat)) });
                });
                path = `${app_constant_1.PrefixFilePath}/Bao_Gia.pdf`;
                const sumQuotation = {
                    sumQuantity: this.getTotal(quotation.details, 'quantity'),
                    sumMoney: this.getTotal(quotation.details, 'intoMoney'),
                    sumVat: this.getTotal(quotation.details, 'total_vat'),
                    total: this.getTotal(quotation.details, 'total'),
                };
                const contentHtml = (0, quotation_2.quotationPDF)(quotation, sumQuotation, headerQuotation);
                yield this.convertPDF(path, contentHtml);
            }
            return path;
        });
    }
}
exports.FileService = FileService;
FileService.getData = [];
