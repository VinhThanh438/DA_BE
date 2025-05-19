import { CellFormulaValue, CellRichTextValue, DataValidation, Worksheet } from 'exceljs';
import { ICustomizeCell, IHeader } from '../interfaces/excel.interface';

// Tính độ sâu tối đa của header để xác định số dòng header
export const getMaxDepth = (headers: any, currentDepth = 0) => {
    let maxDepth = currentDepth;
    for (const header of headers) {
        if (header.children && header.children.length > 0) {
            const childDepth = getMaxDepth(header.children, currentDepth + 1);
            maxDepth = Math.max(maxDepth, childDepth);
        }
    }
    return maxDepth;
};
/**
 *
 * @param worksheet worksheet cần render
 * @param headerData dữ liệu header của excel
 * @param startRow dòng đầu tiên để render header
 * @param startCol cột đầu tiên để render header
 * @param dataCustomize dữ liệu để render custom cell phía trên header
 * @param dataRender dữ liệu để render vào các dòng dưới header
 * @param dataFooter dữ liệu để render footer
 * @param template tuỳ chọn để render ra file excel mẫu
 * @param numberRowTemplate số dòng render mẫu
 */
export function renderExcelHeader(
    worksheet: Worksheet,
    headerData: IHeader[],
    startRow: number,
    startCol: number,
    dataCustomize?: any[] | [],
    dataRender?: any[] | [],
    dataFooter?: any[] | [],
    template?: boolean,
    numberRowTemplate?: number,
) {
    try {
        if (dataCustomize) {
            // to trang het cac o truoc header
            for (let i = 1; i < startRow; i++) {
                for (let j = 1; j <= headerData.length; j++) {
                    worksheet.getCell(i, j).fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFFFF' },
                    };
                }
            }

            dataCustomize.forEach((item: ICustomizeCell) => {
                worksheet.getCell(item.cell).style = item.style;

                if (item.value) {
                    // Ensure value is assignable to CellValue
                    if (
                        typeof item.value === 'string' ||
                        typeof item.value === 'number' ||
                        typeof item.value === 'boolean' ||
                        item.value === null ||
                        (typeof item.value === 'object' &&
                            item.value !== null &&
                            ('formula' in item.value || 'richText' in item.value))
                    ) {
                        worksheet.getCell(item.cell).value = item.value as CellRichTextValue;
                    } else {
                        worksheet.getCell(item.cell).value = String(item.value);
                    }
                }

                if (item.dataValidation) {
                    worksheet.getCell(item.cell).dataValidation = item.dataValidation;
                }

                if (item.colSpan >= 1) {
                    // Cell sẽ có dạng "A1" hoặc "AB1" , cần tách chữ và số sau đó cộng thêm cột tương ứng với số tăng của colSpan
                    const lastCell = `${String.fromCharCode(item.cell.charCodeAt(0) + item.colSpan)}${item.cell.match(/\d/g)}`;
                    worksheet.mergeCells(item.cell, lastCell);
                }
            });
        }

        const maxDepth = getMaxDepth(headerData) + 1; // +1 vì tính cả level đầu tiên

        // Hàm helper để đếm tổng số cột leaf (các cột không có children)
        const countLeafColumns = (headers: any) => {
            let count = 0;
            for (const header of headers) {
                if (!header.children || header.children.length === 0) {
                    count++;
                } else {
                    count += countLeafColumns(header.children);
                }
            }
            return count;
        };

        // Hàm render header theo dạng đệ quy
        const renderHeaders = (headers: any, rowStart: number, colStart: number, currentDepth: number) => {
            let currentCol = colStart;
            headers.forEach((header: any) => {
                worksheet.getRow(rowStart).height = 30;
                const cell = worksheet.getRow(rowStart).getCell(currentCol);
                cell.value = header.header;

                // Style cho cell
                cell.style = header.style;

                if (header.children && header.children.length > 0) {
                    // Có children -> merge cells theo chiều ngang
                    const leafCount = countLeafColumns([header]);
                    worksheet.mergeCells(rowStart, currentCol, rowStart, currentCol + leafCount - 1);

                    // Render children
                    currentCol = renderHeaders(header.children, rowStart + 1, currentCol, currentDepth + 1);
                } else {
                    // Không có children -> set width và merge theo chiều dọc nếu cần
                    worksheet.getColumn(currentCol).width = header.width;
                    if (currentDepth < maxDepth - 1) {
                        worksheet.mergeCells(
                            rowStart,
                            currentCol,
                            rowStart + (maxDepth - currentDepth - 1),
                            currentCol,
                        );
                    }
                    worksheet.getColumn(currentCol).key = header.key;
                    currentCol++;
                }
            });

            return currentCol;
        };

        // Bắt đầu render
        renderHeaders(headerData, startRow, startCol, 0);

        // lấy ra mảng phẳng chứa các cột có children bằng 0
        const leafColumns: any[] = [];

        const flattenHeaders = (headers: any) => {
            headers.forEach((header: any) => {
                if (header.children && header.children.length > 0) {
                    flattenHeaders(header.children);
                } else {
                    leafColumns.push(header);
                }
            });
        };
        flattenHeaders(headerData);

        // nếu template là true thì render template
        if (template && numberRowTemplate && numberRowTemplate > 0) {
            for (let i = 1; i <= numberRowTemplate; i++) {
                worksheet.getRow(startRow + maxDepth + i - 1).height = 25;
                // console.log("countLeafColumns:", countLeafColumns(headerData));
                for (let j = 1; j <= leafColumns.length; j++) {
                    const cell = worksheet.getCell(startRow + maxDepth + i - 1, j);
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' },
                    };

                    if (leafColumns[j - 1].dataValidation) {
                        cell.dataValidation = leafColumns[j - 1].dataValidation as DataValidation;
                        // if (cell.dataValidation.type === "date") {
                        //   cell.numFmt = "dd/mm/yyyy";
                        // } else {
                        //   cell.numFmt = "0";
                        // }
                    }

                    if (leafColumns[j - 1].dataType && leafColumns[j - 1].dataType === 'list') {
                        if (leafColumns[j - 1].dataTypeOptions && leafColumns[j - 1].dataTypeOptions.length > 0) {
                            cell.dataValidation = {
                                type: 'list',
                                allowBlank: true,
                                formulae: [
                                    `"${leafColumns[j - 1].dataTypeOptions.map((item: string) => item).join(',')}"`,
                                ],
                            };
                        }

                        if (leafColumns[j - 1].dataTypeFormulae) {
                            cell.dataValidation = {
                                type: 'list',
                                allowBlank: true,
                                formulae: [leafColumns[j - 1].dataTypeFormulae],
                            };
                        }
                    }

                    if (leafColumns[j - 1].formula !== null && leafColumns[j - 1].formula !== undefined) {
                        const formula = (leafColumns[j - 1].formula as string).replace(
                            /\{i}/g,
                            (i + startRow).toString(),
                        );

                        cell.value = { formula };
                    }
                }
            }
        }

        // nếu có dữ liệu thi render dữ liệu
        if (dataRender && dataRender.length > 0) {
            dataRender.forEach((data, index: number) => {
                const row = worksheet.getRow(startRow + maxDepth + index);
                row.height = 25;

                // chay qua cac cot tu trai qua phai
                for (let i = 1; i <= leafColumns.length; i++) {
                    const cell = row.getCell(i);
                    if (data[leafColumns[i - 1].key] !== undefined) {
                        cell.value = data[leafColumns[i - 1].key];
                    } else {
                        cell.value = null;
                    }
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' },
                    };

                    cell.alignment = {
                        wrapText: true,
                    };
                    if (leafColumns[i - 1].dataValidation) {
                        cell.dataValidation = leafColumns[i - 1].dataValidation as DataValidation;
                        if (cell.dataValidation.type === 'date') {
                            cell.numFmt = 'dd/mm/yyyy';
                        } else {
                            cell.numFmt = '@';
                        }
                    }
                    if (leafColumns[i - 1].dataType && leafColumns[i - 1].dataType === 'list') {
                        if (leafColumns[i - 1].dataTypeOptions && leafColumns[i - 1].dataTypeOptions.length > 0) {
                            cell.dataValidation = {
                                type: 'list',
                                allowBlank: true,
                                formulae: [
                                    `"${leafColumns[i - 1].dataTypeOptions.map((item: string) => item).join(',')}"`,
                                ],
                            };
                        }

                        if (leafColumns[i - 1].dataTypeFormulae) {
                            cell.dataValidation = {
                                type: 'list',
                                allowBlank: true,
                                formulae: [leafColumns[i - 1].dataTypeFormulae],
                            };
                        }
                    }
                    if (leafColumns[i - 1].formula !== null && leafColumns[i - 1].formula !== undefined) {
                        const formula = (leafColumns[i - 1].formula as string).replace(
                            /\{i}/g,
                            (index + startRow + maxDepth).toString(),
                        );

                        cell.value = { formula };
                    }
                }
            });

            // nếu có footer thi render footer
            if (dataFooter && dataFooter.length > 0) {
                // tìm dòng cuối cùng của dữ liệu
                const lastRow = startRow + maxDepth + dataRender.length;
                worksheet.getRow(lastRow).height = 20;

                dataFooter.forEach((item: ICustomizeCell) => {
                    worksheet.getCell(item.cell).style = item.style;
                    if (item.height) {
                        worksheet.getRow(Number(worksheet.getCell(item.cell).row)).height = item.height;
                    } else {
                        worksheet.getRow(Number(worksheet.getCell(item.cell).row)).height = 20;
                    }

                    if (item.value) {
                        // Ensure value is assignable to CellValue
                        if (
                            typeof item.value === 'string' ||
                            typeof item.value === 'number' ||
                            typeof item.value === 'boolean' ||
                            item.value === null ||
                            (typeof item.value === 'object' &&
                                item.value !== null &&
                                ('formula' in item.value || 'richText' in item.value))
                        ) {
                            worksheet.getCell(item.cell).value = item.value as any;
                        } else {
                            worksheet.getCell(item.cell).value = String(item.value);
                        }
                    }

                    if (item.dataValidation) {
                        worksheet.getCell(item.cell).dataValidation = item.dataValidation;
                    }

                    if (item.colSpan >= 1) {
                        // chuyen doi 1 ky tu sang Unicode, vi du A
                        // Cell sẽ có dạng "A1" hoặc "AB1" , cần tách chữ và số sau đó cộng thêm cột tương ứng với số tăng của colSpan
                        const match = item.cell.match(/\d+/);
                        let lastCell = match
                            ? `${String.fromCharCode(item.cell.charCodeAt(0) + item.colSpan)}${match[0]}`
                            : item.cell;

                        if (item.rowSpan && item.rowSpan >= 1) {
                            const matchRow = item.cell.match(/\d+/);
                            lastCell = matchRow
                                ? `${String.fromCharCode(lastCell.charCodeAt(0))}${Number(matchRow[0]) + item.rowSpan}`
                                : lastCell;
                        }

                        worksheet.mergeCells(item.cell, lastCell);
                    }
                });

                // for (let i = 1; i <= Object.keys(dataRender[0]).length; i++) {
                //     const cell = worksheet.getCell(lastRow, i);
                //     const footer = dataFooter.find((item: any) => item.col === i);
                //     if (footer !== undefined) {
                //         if (footer.colSpan > 1) {
                //             // Cell sẽ có dạng "A1" hoặc "AB1" , cần tách chữ và số sau đó cộng thêm cột tương ứng với số tăng của colSpan
                //             worksheet.mergeCells(lastRow, i, lastRow, i + footer.colSpan - 1);
                //         }

                //         cell.value = footer.value;
                //         cell.style = footer.style;
                //     } else {
                //         cell.style = {
                //             font: { bold: true, size: 14 },
                //             alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
                //             border: {
                //                 top: { style: 'thin' },
                //                 left: { style: 'thin' },
                //                 bottom: { style: 'thin' },
                //                 right: { style: 'thin' },
                //             },
                //         };
                //     }
                // }
            }
        }

        return worksheet;
    } catch (error: any) {
        console.log('Error rendering Excel header:', error);
        throw new Error('Error rendering Excel header');
    }
}

//=================================================================================//

// Hàm tính số lượng lá (cột con cuối cùng) của một node
function calculateLeaves(node: any) {
    if (node.children.length === 0) return 1;
    return node.children.reduce((sum: number, child: any) => sum + calculateLeaves(child), 0);
}

// Hàm tính độ sâu tối đa của cây
function getNodeDepth(node: any) {
    if (node.children.length === 0) return 1;
    const maxChildDepth = Math.max(...node.children.map(getNodeDepth));
    return 1 + maxChildDepth;
}

// Hàm xây dựng các hàng header và thông tin cột
function buildHeaders(headerDefinitions: any) {
    const maxDepth = Math.max(...headerDefinitions.map(getNodeDepth));
    let totalColumns = headerDefinitions.reduce((sum: number, node: any) => sum + calculateLeaves(node), 0);
    const rows = Array.from({ length: maxDepth }, () => Array(totalColumns).fill(null));
    const columnsWidth: any = {};

    function processNode(node: any, depth: number, startCol: any) {
        const numCols = calculateLeaves(node);
        // Thêm thông tin vào hàng
        rows[depth][startCol] = {
            header: node.header,
            color: node.color,
            colSpan: numCols,
            key: node.key,
            width: node.width,
            style: node.style,
        };
        // Nếu là node lá, lưu width
        if (node.children.length === 0) {
            columnsWidth[startCol] = node.width;
        } else {
            // Xử lý children
            let currentCol = startCol;
            node.children.forEach((child: any) => {
                const childCols = processNode(child, depth + 1, currentCol);
                currentCol += childCols;
            });
        }
        return numCols;
    }

    let currentCol = 0;
    headerDefinitions.forEach((node: any) => {
        const cols = processNode(node, 0, currentCol);
        currentCol += cols;
    });

    return { rows, columnsWidth };
}

// Hàm tạo Excel và trả về response
export function generateExcel(headers: any, worksheet: Worksheet, startRow: number) {
    const { rows, columnsWidth } = buildHeaders(headers);

    // Thêm các hàng vào worksheet
    rows.forEach((row, rowIdx) => {
        const rowValues = row.map((cell) => cell?.header || '');
        const excelRow = worksheet.addRow(rowValues);

        worksheet.getRow(rowIdx + startRow).height = 30;

        excelRow.eachCell((cell) => {
            cell.font = { bold: true };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
        });

        rowIdx += startRow;

        // Áp dụng style và merge cells
        row.forEach((cell, colIdx) => {
            if (!cell || cell.colSpan === undefined) return; // Bỏ qua ô null hoặc không có colSpan
            const excelCell = excelRow.getCell(colIdx + 1);

            excelCell.style = cell.style;

            // Merge cells nếu có colspan
            if (cell.colSpan > 1) {
                worksheet.mergeCells(
                    rowIdx,
                    colIdx + 1,
                    rowIdx,
                    colIdx + cell.colSpan, // Merge đến cột cuối cùng
                );
            }
        });
    });

    // Đặt độ rộng cột
    Object.entries(columnsWidth).forEach(([colIdx, width]) => {
        worksheet.getColumn(parseInt(colIdx) + 1).width = width as number;
    });

    // lặp qua từng cột và chạy từ trên xuống dưới ở các hàng thuộc header, nếu ô phía dưới không có giá trị thì merge
    const maxDepth = Math.max(...headers.map(getNodeDepth));

    for (let i = 1; i <= Object.values(columnsWidth).length; i++) {
        let mergeStartRow = startRow;
        let mergeEndRow = startRow;
        for (let j = startRow; j < startRow + maxDepth; j++) {
            if (worksheet.getCell(j + 1, i).value === '') {
                mergeStartRow = j;
                mergeEndRow = startRow + maxDepth - 1;

                if (mergeStartRow < mergeEndRow) {
                    worksheet.mergeCells(mergeStartRow, i, mergeEndRow, i);
                }

                break;
            }
        }
    }

    // Trả về workbook
    return worksheet;
}

export const readExcelData = (
    worksheet: Worksheet,
    headerData: IHeader[],
    startRow: number,
    startCol: number,
    dataCustomize?: ICustomizeCell[],
) => {
    try {
        const data: any[] = [];
        const dataCustomizeCell: any = {};

        const headers = headerData.map((header) => header.key);
        const maxRow = worksheet.rowCount;
        const maxCol = startCol + headerData.length - 1;

        for (let i = 0; i < headerData.length; i++) {
            if (worksheet.getCell(startRow, i + startCol).value !== headerData[i].header) {
                throw new Error(
                    `Tiêu đề ở cột ${i}: '${
                        worksheet.getCell(startRow, i + startCol).value
                    }' không khớp với tệp mẫu, giá trị đúng là: '${headerData[i].header}', hãy kiểm tra lại tệp mẫu`,
                );
            }
        }

        for (let i = startRow; i <= maxRow; i++) {
            const row = worksheet.getRow(i + 1);
            const rowData: any = {};

            const cellStart = worksheet.getCell(i + 1, startCol);

            if (!cellStart.value) {
                continue;
            }

            for (let j = startCol; j <= maxCol; j++) {
                const cell = row.getCell(j);

                if (cell.value !== null && typeof cell.value === 'object') {
                    if (cell.value && typeof cell.value === 'object' && 'result' in cell.value) {
                        rowData[headers[j - startCol]] = (cell.value as CellFormulaValue).result;
                    } else if (cell.value && typeof cell.value === 'object' && 'text' in cell.value) {
                        rowData[headers[j - startCol]] = cell.value.text;
                    } else {
                        rowData[headers[j - startCol]] = cell.value;
                    }
                } else {
                    rowData[headers[j - startCol]] = cell.value;
                }

                if (!rowData[headers[j - startCol]]) {
                    rowData[headers[j - startCol]] = null;
                } else {
                    if (typeof rowData[headers[j - startCol]] === 'string') {
                        rowData[headers[j - startCol]] = rowData[headers[j - startCol]].trim();
                        if (rowData[headers[j - startCol]] === '') {
                            rowData[headers[j - startCol]] = null;
                        }
                    }
                }
            }

            data.push(rowData);
        }

        if (dataCustomize && dataCustomize.length > 0) {
            dataCustomize.forEach((item: ICustomizeCell) => {
                const cell = worksheet.getCell(item.cell);

                if (cell.value !== null) {
                    if (typeof cell.value === 'object' && 'result' in cell.value) {
                        dataCustomizeCell[item.key] = (cell.value as CellFormulaValue).result;
                    } else {
                        console.log(dataCustomizeCell[item.key], cell.value);
                        dataCustomizeCell[item.key] = cell.value;
                    }
                }
            });
        }

        return { data, dataCustomizeCell };
    } catch (error: any) {
        throw new Error(error);
    }
};
