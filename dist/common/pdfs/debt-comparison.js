"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatData = exports.debtComparisonPDF = void 0;
const format_number_with_dots_1 = require("../helpers/format-number-with-dots");
const time_adapter_1 = require("../infrastructure/time.adapter");
const debtComparisonPDF = (data, sum, header) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    let sumTotalBeginningDebt = 0;
    let sumTotalDebtIncrease = 0;
    let sumTotalDebtReduction = 0;
    let sumEndingDebt = 0;
    data.details = (0, exports.formatData)(data.details);
    return `<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <style>
    * {
      padding: 0;
      margin: 0;
      line-height: 1.5;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    body {
      font-family: "Times New Roman";
    }
    th,
    td {
      border: 1px solid black;
      padding: 10px;
      text-align: center;
    }
  </style>
  <body>
    <div style="display: flex; align-items: center">
      <h3 style="flex: 1; text-align: center; font-size: 12px">
        CÔNG TY TNHH SX TM THÉP ĐÔNG ANH
      </h3>
      <h3 style="flex: 1; text-align: center; font-size: 12px">
        CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM
      </h3>
    </div>
    <div style="display: flex; align-items: center; font-size: 12px">
      <p style="flex: 1; text-align: center">Số: .......</p>
      <p style="flex: 1; text-align: center">Độc lập_Tự do_Hạnh phúc</p>
    </div>
    <h1 style="text-align: center; font-size: 18px">${header.title}</h1>
    <p style="font-style: italic; margin-left: 18px; font-size: 12px">
      - Căn cứ vào biên bản giao nhận hàng hoá
    </p>
    <p style="font-style: italic; margin-left: 18px; font-size: 12px">
      - Căn cứ vào thoả thuận giữa hai bên
    </p>
    <p style="font-style: italic; font-size: 12px">
      Hôm nay ngày.....tháng.....năm..... tại trụ sở Công ty thép Đông Anh,
      chúng tôi gồm có
    </p>
    <h3 style="font-size: 12px; font-weight: 700">
      I. Bên mua (Bên A): ${((_a = data === null || data === void 0 ? void 0 : data.organization) === null || _a === void 0 ? void 0 : _a.name) || ''}
    </h3>
    <div style="display: flex; align-items: center; font-size: 12px">
      <p style="flex: 1">Địa chỉ: ${((_b = data === null || data === void 0 ? void 0 : data.organization) === null || _b === void 0 ? void 0 : _b.address) || ''}</p>
      <p style="flex: 1">Điện thoại: ${((_c = data === null || data === void 0 ? void 0 : data.organization) === null || _c === void 0 ? void 0 : _c.phone) || ''}</p>
    </div>
    <div style="display: flex; align-items: center; font-size: 12px">
      <p style="flex: 1">Đại diện: ${((_d = data === null || data === void 0 ? void 0 : data.employee) === null || _d === void 0 ? void 0 : _d.name) || ''}</p>
      <p style="flex: 1">Chức vụ: ${((_e = data === null || data === void 0 ? void 0 : data.job_position) === null || _e === void 0 ? void 0 : _e.name) || ''}</p>
    </div>
    <div
      style="
        display: flex;
        align-item: center;
        font-size: 12px;
        font-weight: 700;
      "
    >
      <p style="flex: 1">II. Bên bán (Bên B): ${((_f = data === null || data === void 0 ? void 0 : data.partner) === null || _f === void 0 ? void 0 : _f.name) || ''}</p>
      <p style="flex: 1">Mã KH: ${((_g = data === null || data === void 0 ? void 0 : data.partner) === null || _g === void 0 ? void 0 : _g.code) || ''}</p>
    </div>
    <div style="display: flex; align-items: center; font-size: 12px">
      <p style="flex: 1">Địa chỉ: ${((_h = data === null || data === void 0 ? void 0 : data.partner) === null || _h === void 0 ? void 0 : _h.address) || ''}</p>
      <p style="flex: 1">Điện thoại: ${((_j = data === null || data === void 0 ? void 0 : data.partner) === null || _j === void 0 ? void 0 : _j.phone) || ''}</p>
    </div>
    <div style="display: flex; align-items: center; font-size: 12px">
      <p style="flex: 1">
        Đại diện: ${((_k = data === null || data === void 0 ? void 0 : data.partner) === null || _k === void 0 ? void 0 : _k.representative_name) || ''}
      </p>
      <p style="flex: 1">
        Chức vụ: ${((_l = data === null || data === void 0 ? void 0 : data.partner) === null || _l === void 0 ? void 0 : _l.representative_position) || ''}
      </p>
    </div>
    <p style="margin-left: 18px; font-size: 12px">
      Cùng nhau đối chiếu công nợ giữa hai bên với số liệu như sau:
    </p>
    <div style="display: flex; align-items: center; font-size: 12px">
      <p style="margin-left: 18px">1 Công nợ đầu kỳ:</p>
      <p style="margin-left: 18px">
        ${(data === null || data === void 0 ? void 0 : data.beginning_debt) ? (0, format_number_with_dots_1.formatNumberWithDots)(data.beginning_debt) : ''}
      </p>
    </div>

    <p style="margin-left: 18px; font-size: 12px">
      2 Công nợ phát sinh trong kỳ:
    </p>
    <table style="font-size: 12px">
      <tr>
        <th rowspan="2">STT</th>
        <th rowspan="2">Ngày HĐ</th>
        <th rowspan="2">Số HĐ VAT</th>
        <th rowspan="2">Nội dung</th>
        <th rowspan="2">Nợ đầu kỳ</th>
        <th rowspan="2">Tăng trong kỳ</th>
        <th colspan="3">Thanh toán</th>
        <th rowspan="2">Nợ cuối kỳ</th>
        <th rowspan="2">Số ĐH</th>
      </tr>
      <tr>
        <th style="background-color: yellow">Số tiền</th>
        <th style="background-color: yellow">Ngày</th>
        <th style="background-color: yellow">Ngân hàng</th>
      </tr>
      ${(data.details || [])
        .map((item, index) => {
        var _a, _b, _c, _d;
        sumTotalBeginningDebt += (item === null || item === void 0 ? void 0 : item.beginning_debt) || 0;
        sumTotalDebtIncrease += (item === null || item === void 0 ? void 0 : item.debt_increase) || 0;
        sumTotalDebtReduction += (item === null || item === void 0 ? void 0 : item.debt_reduction) || 0;
        sumEndingDebt += (item === null || item === void 0 ? void 0 : item.ending_debt) || 0;
        return `
          <tr>
            <td>${item === null || item === void 0 ? void 0 : item.index}</td>
            <td>
              ${((_a = item === null || item === void 0 ? void 0 : item.invoice) === null || _a === void 0 ? void 0 : _a.invoice_date) ? time_adapter_1.TimeAdapter.format(item.invoice.invoice_date, 'DD/MM/YYYY') : ''}
            </td>
            <td>${((_b = item.invoice) === null || _b === void 0 ? void 0 : _b.code) || ''}</td>
            <td>${((_c = item === null || item === void 0 ? void 0 : item.invoice) === null || _c === void 0 ? void 0 : _c.content) || ''}</td>
            <td>
              ${(item === null || item === void 0 ? void 0 : item.beginning_debt) ? (0, format_number_with_dots_1.formatNumberWithDots)(item === null || item === void 0 ? void 0 : item.beginning_debt) : ''}
            </td>
            <td>
              ${(item === null || item === void 0 ? void 0 : item.debt_increase) ? (0, format_number_with_dots_1.formatNumberWithDots)(item === null || item === void 0 ? void 0 : item.debt_increase) : ''}
            </td>
            <td>
              ${(item === null || item === void 0 ? void 0 : item.debt_reduction) ? (0, format_number_with_dots_1.formatNumberWithDots)(item === null || item === void 0 ? void 0 : item.debt_reduction) : ''}
            </td>
            <td>
              ${item.payment_date ? time_adapter_1.TimeAdapter.format(item.payment_date, 'DD/MM/YYYY') : ''}
            </td>
            <td>${(item === null || item === void 0 ? void 0 : item.bank) || ''}</td>
            <td>
              ${(item === null || item === void 0 ? void 0 : item.ending_debt) ? (0, format_number_with_dots_1.formatNumberWithDots)(item === null || item === void 0 ? void 0 : item.ending_debt) : ''}
            </td>
            <td>${((_d = item === null || item === void 0 ? void 0 : item.order) === null || _d === void 0 ? void 0 : _d.code) || ''}</td>
          </tr>
      `;
    })
        .join('')}
        <tr style="font-weight: 800">
          <td colspan="4">Tổng</td>
          <td>${sumTotalBeginningDebt ? (0, format_number_with_dots_1.formatNumberWithDots)(sumTotalBeginningDebt) : ''}</td>
          <td>${sumTotalDebtIncrease ? (0, format_number_with_dots_1.formatNumberWithDots)(sumTotalDebtIncrease) : ''}</td>
          <td>${sumTotalDebtReduction ? (0, format_number_with_dots_1.formatNumberWithDots)(sumTotalDebtReduction) : ''}</td>
          <td></td>
          <td></td>
          <td>${sumEndingDebt ? (0, format_number_with_dots_1.formatNumberWithDots)(sumEndingDebt) : ''}</td>
          <td></td>
        </tr>
      <tr>
        <td colspan="12" style="text-align: left">
          Bằng chữ: ${sumEndingDebt ? (0, format_number_with_dots_1.capitalizeWords)((0, format_number_with_dots_1.convertMoneyText)(sumEndingDebt)) : ''}
        </td>
      </tr>
    </table>
    <p style="font-size: 11px">
      Biên bản này được lập thành 02 bản có giá trị như nhau. Mỗi bên giữ 01 bản
      làm cơ sở cho việc thanh toán sau này giữa hai bên. trong vòng 03 ngày làm
      việc kể từ ngày nhận được biên bản đối chiếu công nợ này mà bên B không
      nhận được phản hồi từ quý công ty thì công nợ trên coi như được chấp nhận
    </p>
    <br />
    <div
      style="
        display: flex;
        align-items: center;
        font-weight: 800;
        font-size: 12px;
      "
    >
      <p style="flex: 1; text-align: center">ĐẠI DIỆN BÊN A</p>
      <p style="flex: 1; text-align: center">ĐẠI DIỆN BÊN B</p>
    </div>
  </body>
</html>
`;
};
exports.debtComparisonPDF = debtComparisonPDF;
const formatData = (data) => {
    const result = [];
    data.forEach((data, index) => {
        var _a, _b;
        const total_amount = ((_a = data.invoice) === null || _a === void 0 ? void 0 : _a.total_amount) || 0;
        const total_amount_paid = ((_b = data.invoice) === null || _b === void 0 ? void 0 : _b.total_amount_paid) || 0;
        const debt_increase = data.beginning_debt ? 0 : total_amount;
        const current_debt = total_amount - total_amount_paid;
        if (!data.transactions || data.transactions.length === 0) {
            result.push(Object.assign(Object.assign({}, data), { index: index + 1, debt_increase,
                current_debt }));
        }
        else {
            data.transactions.forEach((log, idx) => {
                var _a, _b;
                if (idx === 0) {
                    result.push(Object.assign(Object.assign({}, data), { index: index + 1, debt_increase, payment_date: log.time_at, debt_reduction: log.amount, bank: (_a = log.bank) === null || _a === void 0 ? void 0 : _a.bank, current_debt }));
                }
                else {
                    result.push({
                        index: '',
                        payment_date: log.time_at,
                        debt_reduction: log.amount,
                        bank: (_b = log.bank) === null || _b === void 0 ? void 0 : _b.bank,
                    });
                }
            });
        }
    });
    return result;
};
exports.formatData = formatData;
