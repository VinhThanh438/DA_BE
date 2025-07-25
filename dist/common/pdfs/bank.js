"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bankPDF = void 0;
const format_number_with_dots_1 = require("../helpers/format-number-with-dots");
const time_adapter_1 = require("../infrastructure/time.adapter");
const app_constant_1 = require("../../config/app.constant");
const bankPDF = (data, sum) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const transactions = data.transactions || [];
    let sumIncome = 0;
    let sumExpense = 0;
    let currentDebt = 0;
    const contentMap = {
        [app_constant_1.TransactionOrderType.ORDER]: 'Thanh toán đơn hàng',
        [app_constant_1.TransactionOrderType.COMMISSION]: 'Thanh toán hoa hồng',
        [app_constant_1.TransactionOrderType.INTEREST]: 'Thanh toán lãi khoản vay',
        [app_constant_1.TransactionOrderType.LOAN]: 'Thanh toán dư nợ khoản vay',
    };
    return `<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
    </head>
    <style>
        *{
            padding: 0;
            margin: 0;
            line-height: 1.5;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        body{
               font-family: "Times New Roman";
      
        }
        
        th,
        td {
            border: 1px solid black;
            padding: 10px;
            text-align: center;
        }
            table th:last-child,
        table td:last-child {
            border-right: 1px solid black !important;
        }
    </style>
    <body>
        <p >${((_b = (_a = transactions[0]) === null || _a === void 0 ? void 0 : _a.bank) === null || _b === void 0 ? void 0 : _b.name) || ''}</p>
        <p style="font-size: 14px">STK: ${((_d = (_c = transactions[0]) === null || _c === void 0 ? void 0 : _c.bank) === null || _d === void 0 ? void 0 : _d.account_number) || ''}</p>
        <div style="display: flex; width: 100vw; align-items: center">
            <div style="flex: 1; font-size: 12px;">Nhật ký giao dịch Ngân hàng ${((_f = (_e = transactions[0]) === null || _e === void 0 ? void 0 : _e.bank) === null || _f === void 0 ? void 0 : _f.bank) || ''}</div>
            <h1 style="flex: 1;font-size: 18px; text-align: center">${((_h = (_g = transactions[0]) === null || _g === void 0 ? void 0 : _g.bank) === null || _h === void 0 ? void 0 : _h.bank) || ''}</h1>
        </div>
        <div style=" font-size: 12px;">Đơn vị: VNĐ</div>
        </br>
        <table style="font-size: 12px;">
            <tr>
                <th rowspan="2">STT</th>
                <th rowspan="2">Ngày</th>
                <th rowspan="2">Nội dung</th>
                <th rowspan="2">Mã khách hàng</th>
                <th colspan="2">Số dư đầu kỳ</th>
                <th style="color: red">${(data === null || data === void 0 ? void 0 : data.beginning) ? (0, format_number_with_dots_1.formatNumberWithDots)(data === null || data === void 0 ? void 0 : data.beginning) : ''}</th>
                <th style="color: red"   colspan="2">Số</th>
            </tr>
            <tr>
                <th>Phát sinh có</th>
                <th>Phát sinh nợ</th>
                <th>Số dư</th>
                <th>Đơn hàng</th>
                <th>Hóa đơn</th>
            </tr>
                ${transactions
        .map((item, index) => {
        var _a, _b, _c;
        let parseAmount = parseInt((item === null || item === void 0 ? void 0 : item.amount) || 0);
        if ((item === null || item === void 0 ? void 0 : item.type) === app_constant_1.TransactionType.IN) {
            sumIncome += parseAmount;
            currentDebt = (currentDebt === 0 ? (data === null || data === void 0 ? void 0 : data.beginning) || 0 : currentDebt) + parseAmount;
        }
        else if ((item === null || item === void 0 ? void 0 : item.type) === app_constant_1.TransactionType.OUT) {
            sumExpense += parseAmount;
            currentDebt = (currentDebt === 0 ? (data === null || data === void 0 ? void 0 : data.beginning) || 0 : currentDebt) - parseAmount;
        }
        // sumDebt += currentDebt;
        return `<tr>
                    <td>${index + 1}</td>
                    <td>${(item === null || item === void 0 ? void 0 : item.time_at) ? time_adapter_1.TimeAdapter.format(item.time_at, 'DD/MM/YYYY') : ''}</td>
                    <td style="text-align: left">${contentMap[item === null || item === void 0 ? void 0 : item.order_type]}</td>
                    <td style="color: red">${((_a = item === null || item === void 0 ? void 0 : item.partner) === null || _a === void 0 ? void 0 : _a.code) || ''}</td>
                    <td>${(item === null || item === void 0 ? void 0 : item.type) === app_constant_1.TransactionType.IN && parseAmount > 0 ? (0, format_number_with_dots_1.formatNumberWithDots)(parseAmount) : ''}</td>
                    <td>${(item === null || item === void 0 ? void 0 : item.type) === app_constant_1.TransactionType.OUT && parseAmount > 0 ? (0, format_number_with_dots_1.formatNumberWithDots)(parseAmount) : ''}</td>
                    <td>${(0, format_number_with_dots_1.formatNumberWithDots)(currentDebt)}</td>
                    <td>${((_b = item === null || item === void 0 ? void 0 : item.order) === null || _b === void 0 ? void 0 : _b.code) || ''}</td>
                    <td>${((_c = item === null || item === void 0 ? void 0 : item.invoice) === null || _c === void 0 ? void 0 : _c.code) || ''}</td>
                    </tr>`;
    })
        .join('')}
            <tr>
                <td colspan="4">Tổng</td>
                <td style=" font-weight: 700">
                    ${sumIncome ? (0, format_number_with_dots_1.formatNumberWithDots)(sumIncome) : ''}
                  </td>
                <td style=" font-weight: 700">${sumExpense ? (0, format_number_with_dots_1.formatNumberWithDots)(sumExpense) : ''}</td>
                <td style=" font-weight: 700">${currentDebt ? (0, format_number_with_dots_1.formatNumberWithDots)(currentDebt) : ''}</td>
                <td></td>
                <td></td>
            </tr>
            <tr>
                <td colspan="7" style="text-align: left">Số dư bằng chữ: ${currentDebt ? (0, format_number_with_dots_1.capitalizeWords)((0, format_number_with_dots_1.convertMoneyText)(currentDebt)) : ''}</td>
                <td></td>
                <td></td>
            </tr>
        </table>
    </body>
</html>`;
};
exports.bankPDF = bankPDF;
