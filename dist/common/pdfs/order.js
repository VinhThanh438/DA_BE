"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderPDF = void 0;
const format_number_with_dots_1 = require("../helpers/format-number-with-dots");
const formatPhoneNumber_1 = require("../helpers/formatPhoneNumber");
const app_constant_1 = require("../../config/app.constant");
const orderPDF = (data, header, sum) => {
    let totalMoney = 0;
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

  <body style="padding: 0 20px; font-family: 'Times New Roman', Times, serif">
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
              ${header.company || ''}
            </p>
            <div style="display: flex; font-size: 14px">
              <div>
                <p style="margin: 0">Địa chỉ: ${header.address || ''}</p>
                <p style="margin: 0">
                  Điện thoại: 024.39686769 – Hotline: 0978.993.999
                </p>
                <p style="margin: 0">MST: ${header.tax_code || ''}</p>
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
            align-items: center;
            justify-content: space-between;
          "
        >
          <div style="display: flex">
            <p style="font-size: 14px">Số:</p>
            <p style="font-size: 14px; color: red">010325</p>
            <p style="font-size: 14px">ĐA/</p>
            <p style="font-size: 14px; color: red">DA</p>
          </div>

          <i style="font-size: 12px">Ngày 28 tháng 03 năm 2026</i>
        </div>
        <p
          style="
            text-align: center;
            font-size: 28px;
            font-weight: 600;
            margin-right: 1%;
          "
        >
          ĐƠN ĐẶT HÀNG
        </p>
        <div style="display: flex; align-items: center; width: 100%">
          <p
            style="
              text-decoration: underline;
              font-weight: 600;
              flex: 2;
              font-size: 13px;
            "
          >
            Tên nhà cung cấp
          </p>
          <p style="flex: 2; font-size: 13px">:</p>
          <p style="flex: 8; font-size: 13px; font-weight: 600">
            ${header.partner_name || ''}
          </p>
        </div>
        <div style="display: flex; align-items: center; width: 100%">
          <p style="text-decoration: underline; font-size: 12px; flex: 2">
            Địa chỉ
          </p>
          <p style="flex: 2">:</p>
          <p style="flex: 8; font-size: 12px">${header.oAddress || ''}</p>
        </div>
        <div style="display: flex; align-items: center; width: 100%">
          <p style="text-decoration: underline; font-size: 12px; flex: 2">
            Đại diện
          </p>
          <p style="flex: 2; font-size: 12px">:</p>
          <div style="flex: 8; display: flex; gap: 30px; font-size: 12px">
            <p style="font-size: 12px; flex: 1.5">${header.represent || ''}</p>
            <p style="font-size: 12px; flex: 1.5">
              ĐT: ${header.phone_number ? (0, formatPhoneNumber_1.formatPhoneNumber)(header.phone_number) : ''}
            </p>
            <p style="font-size: 12px">Email: ${header.email || ''}</p>
          </div>
        </div>
        <i style="font-size: 12px"
          >Công ty TNHH SX TM Thép Đông Anh gửi đến quý công ty đơn hàng với nội
          dung sau:</i
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
        ${data
        .map((item) => {
        return `
        <tr>
          <td style="font-size: 14px">${item.stt}</td>
          <td style="font-size: 14px">${item.product_name || ''}</td>
          <td style="font-size: 14px">${item.unit || ''}</td>
          <td style="color: red; font-size: 14px">
            ${item.quantity ? (0, format_number_with_dots_1.formatNumberWithDots)(item.quantity) : ''}
          </td>
          <td style="color: red; font-size: 14px">
            ${item.price ? (0, format_number_with_dots_1.formatNumberWithDots)(item.price) : ''}
          </td>
          <td style="font-size: 14px">
            ${item.total_money ? (0, format_number_with_dots_1.formatNumberWithDots)(item.total_money) : ''}
          </td>
          <td style="color: red; font-size: 14px">${item.vat || ''}%</td>
          <td style="font-size: 14px">
            ${item.total_money_vat ? (0, format_number_with_dots_1.formatNumberWithDots)(item.total_money_vat) : ''}
          </td>
          <td style="font-size: 14px">
            ${item.total_money_all ? (0, format_number_with_dots_1.formatNumberWithDots)(item.total_money_all) : ''}
          </td>
        </tr>
        `;
    })
        .join('')}
        <tr>
          <th colspan="2" style="font-size: 14px">Tổng</th>
          <th style="font-size: 14px">Kg</th>
          <th style="font-size: 14px">
            ${sum.quantity ? (0, format_number_with_dots_1.formatNumberWithDots)(sum.quantity) : ''}
          </th>
          <th></th>
          <th style="font-size: 14px">
            ${sum.total_money ? (0, format_number_with_dots_1.formatNumberWithDots)(sum.total_money) : ''}
          </th>
          <th></th>
          <th style="font-size: 14px">
            ${sum.total_money_vat ? (0, format_number_with_dots_1.formatNumberWithDots)(sum.total_money_vat) : ''}
          </th>
          <th style="font-size: 14px">
            ${sum.total_money_all ? (0, format_number_with_dots_1.formatNumberWithDots)(sum.total_money_all) : ''}
          </th>
        </tr>

        <tr>
          <td colspan="9" style="text-align: left">
            <i style="font-size: 14px">
              Bằng chữ: Một tỷ năm trăm tám mươi sáu triệu hai trăm nghìn đồng
            </i>
          </td>
        </tr>
      </table>

      <div style="display: flex; align-items: center; margin-top: 10px">
        <b style="font-size: 13px">1</b>
        <b style="font-size: 13px; flex: 2; margin-left: 1%">Chất lượng hàng</b>
        <p style="flex: 1">:</p>
        <i style="font-size: 13px; flex: 6"
          >&nbsp Mới 100%, chưa qua sử dụng, chất lượng theo công bố</i
        >
      </div>

      <div style="display: flex; align-items: center">
        <b style="font-size: 13px">2</b>
        <b style="font-size: 13px; flex: 2; margin-left: 1%"
          >Địa điểm giao hàng
        </b>
        <p style="flex: 1">:</p>

        <i style="font-size: 13px; flex: 6"
          >&nbspKho bên mua, cước phí vận chuyển bên bán chịu</i
        >
      </div>
      <div style="display: flex; align-items: center">
        <b style="font-size: 13px">3</b>
        <b style="font-size: 13px; flex: 2; margin-left: 1%"
          >Phương thức giao hàng:
        </b>
        <p style="flex: 1">:</p>

        <i style="font-size: 13px; flex: 6"
          >&nbspHàng giao kg thực tế, bên mua hạ hàng</i
        >
      </div>
      <div style="display: flex; align-items: center">
        <b style="font-size: 13px">4</b>
        <b style="font-size: 13px; flex: 2; margin-left: 1%"
          >Thời gian giao hàng:
        </b>
        <p style="flex: 1">:</p>
        <i style="font-size: 13px; flex: 6">&nbspTheo thỏa thuận của hai bên</i>
      </div>
      <div style="display: flex; align-items: center">
        <b style="font-size: 13px">5</b>
        <b style="font-size: 13px; flex: 2; margin-left: 1%">Thanh toán: </b>
        <p style="flex: 1">:</p>
        <i style="font-size: 13px; flex: 6"
          >&nbspThanh toán 100% ngay khi đặt hàng</i
        >
      </div>
      <p style="text-align: center">
        <b
          ><i style="font-size: 13px"
            >&nbspRất mong nhận được sự hợp tác của Quý công ty</i
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
exports.orderPDF = orderPDF;
