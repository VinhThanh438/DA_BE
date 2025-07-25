"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quotationPDF = void 0;
const format_number_with_dots_1 = require("../helpers/format-number-with-dots");
const formatPhoneNumber_1 = require("../helpers/formatPhoneNumber");
const app_constant_1 = require("../../config/app.constant");
const quotationPDF = (quotation, sum, header) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    let totalMoneyAll = 0;
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
      border: 1px solid black;

      width: 100%;
      border-collapse: collapse;
    }
    th,
    td {
      border: 1px solid black;
      padding: 10px;
      text-align: center;
    }
    body {
      font-family: "Times New Roman", Times, serif;
    }
  </style>

  <body style="padding: 0 20px">
    <div id="order">
      <div style="padding: 0 18px; width: 100%">
        <div style="display: flex; align-items: center">
          <div
            style="
              width: 20%;
              display: flex;
              flex-direction: column;
              align-items: center;
            "
          >
            <img style="height: 60px" src="${app_constant_1.logoLeft}" />
            <p style="font-weight: 600; font-size: 12px">ISO 9001:2015</p>
          </div>
          <div style="font-size: 14px">
            <p style="font-weight: 600; font-size: 15px; flex: 2">
              ${((_a = header.organization) === null || _a === void 0 ? void 0 : _a.name) || ''}
            </p>
            <div style="display: flex; font-size: 14px">
              <div>
                <p style="margin: 0">Địa chỉ: ${((_b = header.organization) === null || _b === void 0 ? void 0 : _b.address) || ''}</p>
                <p style="margin: 0">
                  Điện thoại: 024.39686769 – Hotline: 0978.993.999
                </p>
                <p style="margin: 0">MST: ${((_c = header.organization) === null || _c === void 0 ? void 0 : _c.tax_code) || ''}</p>
              </div>
              <div style="margin-top: 8px">
                <img src="${app_constant_1.logoRight}" alt="Logo" style="height: 60px" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <hr style="margin-bottom: 1px" />
      <hr />

      <div style="padding: 0 20px">
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 20px;
          "
        >
          <!-- Bên trái -->
          <div style="display: flex; gap: 4px">
            <p style="font-size: 14px">Số:</p>
            <p style="font-size: 14px; color: red">010325</p>
            <p style="font-size: 14px">ĐA/</p>
            <p style="font-size: 14px; color: red">DA</p>
          </div>

          <!-- Bên phải -->
          <i style="font-size: 12px">${header.timeAt || ''}</i>
        </div>

        <p style="text-align: center; font-size: 28px; font-weight: bold";>BÁO GIÁ</p>
        <div style="display: flex; align-items: center; width: 100%">
          <p
            style="
              text-decoration: underline;
              font-weight: 700;
              flex: 4;
              font-size: 13px;
            "
          >
            Tên khách hàng
          </p>
          <p style="flex: 1; font-size: 13px">:</p>
          <p style="flex: 15; font-size: 13px; font-weight: 700">
            ${((_d = header.partner) === null || _d === void 0 ? void 0 : _d.name) || ''}
          </p>
        </div>
        <div style="display: flex; align-items: center; width: 100%">
          <p style="text-decoration: underline; font-size: 12px; flex: 4">
            Địa chỉ
          </p>
          <p style="flex: 1">:</p>
          <p style="flex: 15; font-size: 12px">${((_e = header.partner) === null || _e === void 0 ? void 0 : _e.address) || ''}</p>
        </div>
        <div style="display: flex; align-items: center; width: 100%">
          <p style="text-decoration: underline; font-size: 12px; flex: 4">
            Đại diện
          </p>
          <p style="flex: 1; font-size: 12px">:</p>
          <div style="flex: 15; display: flex; gap: 30px; font-size: 12px">
            <p style="font-size: 12px">${((_f = header.partner) === null || _f === void 0 ? void 0 : _f.representative_name) || ''}</p>
            <p style="font-size: 12px">
              ĐT: ${((_g = header.partner) === null || _g === void 0 ? void 0 : _g.phone) ? (0, formatPhoneNumber_1.formatPhoneNumber)(header.partner.phone) : ''}
            </p>
            <p style="font-size: 12px">Email: ${((_h = header.partner) === null || _h === void 0 ? void 0 : _h.email) || ''}</p>
          </div>
        </div>
        <i style="font-size: 12px"
          >Theo nhu cầu của Quý khách hàng, Công ty TNHH SX TM Thép Đông Anh xin
          được báo giá như sau:</i
        >
      </div>

      <table>
        <tr>
          <th rowspan="2" style="font-size: 14px">STT</th>
          <th rowspan="2" style="font-size: 14px">Tên hàng và quy cách</th>
          <th rowspan="2" style="font-size: 14px">Đvt</th>
          <th rowspan="2" style="font-size: 14px">Số lượng</th>
          <th style="font-size: 14px">Đơn giá</th>
          <th style="font-size: 14px">Thành tiền</th>
          <th style="font-size: 14px" colspan="2">VAT</th>
          <th style="font-size: 14px">Tổng tiền</th>
        </tr>
        <tr>
          <th style="background-color: yellow; font-size: 14px">Vnđ</th>
          <th style="background-color: yellow; font-size: 14px">Vnđ</th>
          <th style="background-color: yellow; font-size: 14px">%</th>
          <th style="background-color: yellow; font-size: 14px">Vnđ</th>
          <th style="background-color: yellow; font-size: 14px">Vnđ</th>
        </tr>
        ${quotation.details
        .map((item) => {
        var _a, _b;
        const quantity = item.quantity;
        const price = item.price;
        const totalMoney = quantity * price;
        const vatMoney = item.total_vat;
        const vat = item.vat;
        const total = item.price * item.quantity + item.total_vat;
        totalMoneyAll += total;
        return `
        <tr>
          <td style="font-size: 14px">${item.index}</td>
          <td style="font-size: 14px">${((_a = item.product) === null || _a === void 0 ? void 0 : _a.name) || ''}</td>
          <td style="font-size: 14px">${((_b = item.unit) === null || _b === void 0 ? void 0 : _b.name) || ''}</td>
          <td style="color: red; font-size: 14px">
            ${(0, format_number_with_dots_1.formatNumberWithDots)(quantity)}
          </td>
          <td style="color: red; font-size: 14px">
            ${(0, format_number_with_dots_1.formatNumberWithDots)(price)}
          </td>
          <td style="font-size: 14px">
            ${(0, format_number_with_dots_1.formatNumberWithDots)(totalMoney)}
          </td>
          <td style="color: red; font-size: 14px">${vat + '%'}</td>
          <td style="font-size: 14px">
            ${(0, format_number_with_dots_1.formatNumberWithDots)(vatMoney)}
          </td>
          <td style="font-size: 14px">
            ${(0, format_number_with_dots_1.formatNumberWithDots)(total)}
          </td>
        </tr>
        `;
    })
        .join('')}
        <tr>
          <th colspan="2" style="font-size: 14px">Tổng</th>
          <th style="font-size: 14px"></th>
          <th style="font-size: 14px">
            ${sum.sumQuantity ? (0, format_number_with_dots_1.formatNumberWithDots)(sum.sumQuantity) : ''}
          </th>
          <th></th>
          <th style="font-size: 14px">
            ${sum.sumMoney ? (0, format_number_with_dots_1.formatNumberWithDots)(sum.sumMoney) : ''}
          </th>
          <th></th>
          <th style="font-size: 14px">
            ${sum.sumVat ? (0, format_number_with_dots_1.formatNumberWithDots)(sum.sumVat) : ''}
          </th>
          <th style="font-size: 14px">
            ${(0, format_number_with_dots_1.formatNumberWithDots)(totalMoneyAll)}
          </th>
        </tr>
        <tr>
          <td colspan="9" style="text-align: left">
            <i style="font-size: 14px"
              >Bằng chữ: ${(0, format_number_with_dots_1.capitalizeWords)((0, format_number_with_dots_1.convertMoneyText)(totalMoneyAll)) || ''}</i
            >
          </td>
        </tr>
      </table>

      <div style="display: flex; align-items: center; margin-top: 10px">
        <b style="font-size: 13px">1</b>
        <b style="font-size: 13px; flex: 2; margin-left: 1%">Chất lượng hàng</b>
        <p style="flex: 1">:</p>
        <div style="flex: 6; font-style: italic">
          <p style="font-size: 13px">${quotation.product_quality}</p>
        </div>
      </div>
      <div style="display: flex; align-items: center">
        <b style="font-size: 13px">2</b>
        <b style="font-size: 13px; flex: 2; margin-left: 1%"
          >Địa điểm giao hàng
        </b>
        <p style="flex: 1">:</p>

        <i style="font-size: 13px; flex: 6"
          >${quotation.delivery_location}</i
        >
      </div>
      <div style="display: flex; align-items: center">
        <b style="font-size: 13px">3</b>
        <b style="font-size: 13px; flex: 2; margin-left: 1%"
          >Phương thức giao hàng:
        </b>
        <p style="flex: 1">:</p>

        <i style="font-size: 13px; flex: 6"
          >${quotation.delivery_method}</i
        >
      </div>
      <div style="display: flex; align-items: center">
        <b style="font-size: 13px">4</b>
        <b style="font-size: 13px; flex: 2; margin-left: 1%"
          >Thời gian giao hàng:
        </b>
        <p style="flex: 1">:</p>
        <i style="font-size: 13px; flex: 6">${quotation.delivery_time}</i>
      </div>
      <div style="display: flex; align-items: center">
        <b style="font-size: 13px">5</b>
        <b style="font-size: 13px; flex: 2; margin-left: 1%">Thanh toán: </b>
        <p style="flex: 1">:</p>
        <i style="font-size: 13px; flex: 6"
          >${quotation.payment_note}</i
        >
      </div>
      <div style="display: flex; align-items: center">
        <b style="font-size: 13px">6</b>
        <b style="font-size: 13px; flex: 2; margin-left: 1%"
          >Thời hạn báo giá:</b
        >
        <p style="flex: 1">:</p>
        <i style="font-size: 13px; flex: 6">&nbspHết ngày ${quotation.expired_date}</i>
      </div>
      <p style="text-align: center">
        <b
          ><i style="font-size: 13px"
            >${quotation.additional_note}</i
          ></b
        >
      </p>
      <br />
      <div style="display: flex; align-items: center">
        <h3 style="flex: 1; text-align: center; font-size: 13px">
          XÁC NHẬN CỦA KHÁCH HÀNG
        </h3>
        <h3 style="flex: 1; text-align: center; font-size: 13px">
          CT.TNHH SX TM THÉP ĐÔNG ANH
        </h3>
      </div>
    </div>
  </body>
</html>
`;
};
exports.quotationPDF = quotationPDF;
