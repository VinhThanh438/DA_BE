import { renderExcelHeader } from '@common/helpers/excel';
import * as ExcelJS from 'exceljs';
import { importWarehouseHeader, importWarehouseCustomizeHeader } from '@common/excels/purchaseOrder';

export class ExcelService {
    private static instance: ExcelService;

    private constructor() {}

    public static getInstance(): ExcelService {
        if (!this.instance) {
            this.instance = new ExcelService();
        }
        return this.instance;
    }

    // bieu mau don dat hang
    public async exportExcelPurchaseOrder(data: any[], fileName: string): Promise<void> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        // Add column headers
        worksheet.columns = Object.keys(data[0]).map((key) => ({ header: key, key }));

        // Add rows
        data.forEach((item) => {
            worksheet.addRow(item);
        });

        // Save the workbook to a file
        await workbook.xlsx.writeFile(fileName);
    }

    // bieu mau hop dong mua hang
    public async exportExcelPurchaseContract(data: any[], fileName: string): Promise<void> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        // Add column headers
        worksheet.columns = Object.keys(data[0]).map((key) => ({ header: key, key }));

        // Add rows
        data.forEach((item) => {
            worksheet.addRow(item);
        });

        // Save the workbook to a file
        await workbook.xlsx.writeFile(fileName);
    }

    // bieu mau nhap kho vat tu
    public async exportExcelImportWarehouse(id: number): Promise<string> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        const startRow = 18;
        const startColumn = 1;

        renderExcelHeader(
            worksheet,
            importWarehouseHeader,
            startRow,
            startColumn,
            importWarehouseCustomizeHeader,
            [],
            [],
        );

        const path = `uploads/import_warehouse_${id}.xlsx`;

        // Save the workbook to a file
        await workbook.xlsx.writeFile(path);

        return path;
    }

    // bieu mau hoa hong cho nguoi ban hang
    public async exportExcelSalesCommission(data: any[], fileName: string): Promise<void> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        // Add column headers
        worksheet.columns = Object.keys(data[0]).map((key) => ({ header: key, key }));

        // Add rows
        data.forEach((item) => {
            worksheet.addRow(item);
        });

        // Save the workbook to a file
        await workbook.xlsx.writeFile(fileName);
    }

    // bieu mau thanh toan
    public async exportExcelPayment(data: any[], fileName: string): Promise<void> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        // Add column headers
        worksheet.columns = Object.keys(data[0]).map((key) => ({ header: key, key }));

        // Add rows
        data.forEach((item) => {
            worksheet.addRow(item);
        });

        // Save the workbook to a file
        await workbook.xlsx.writeFile(fileName);
    }
}
