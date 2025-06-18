import { capitalizeWords, convertMoneyText, formatNumberWithDots } from "@common/helpers/format-number-with-dots";
import { formatPhoneNumber } from "@common/helpers/formatPhoneNumber";
import { logoLeft, logoRight } from "@config/app.constant";

export const orderPDF = (data: any[], header: any, sum: any) => {
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
  </style>

  <body style="padding: 0 20px">
    <div
      style="
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 20px;
      "
    >
      <div style="display: flex; flex-direction: column; align-items: center">
        <img style="height: 100px" src="${logoLeft}" />
        <p style="font-weight: 600; font-size: 12px">ISO 9001:2015</p>
      </div>
      <div style="display: flex; align-items: left; flex-direction: column">
        <p style="font-weight: 600; font-size: 15px">${header.company || ''}</p>
        <p style="font-size: 12px">Địa chỉ: ${header.address || ''}</p>
        <p style="font-size: 12px">${header.contact || ''}</p>
        <p style="font-size: 12px">MST: ${header.tax_code || ''}</p>
      </div>
      <img style="height: 80px" src="${logoRight}" />
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

        <i style="font-size: 12px">${header.time_at || ''}</i>
      </div>
      <p style="text-align: center; font-size: 28px">ĐƠN ĐẶT HÀNG</p>
      <div style="display: flex; align-items: center; width: 100%">
        <p
          style="
            text-decoration: underline;
            font-weight: 700;
            flex: 3;
            font-size: 13px;
          "
        >
          Tên nhà cung cấp
        </p>
        <p style="font-weight: 700; flex: 1; font-size: 13px">:</p>
        <p style="flex: 15; font-size: 13px; font-weight: 700">
          ${header.partner_name || ''}
        </p>
      </div>
      <div style="display: flex; align-items: center; width: 100%">
        <p style="text-decoration: underline; font-size: 12px; flex: 3">
          Địa chỉ
        </p>
        <p style="font-weight: 700; flex: 1">:</p>
        <p style="flex: 15; font-size: 12px">${header.oAddress || ''}</p>
      </div>
      <div style="display: flex; align-items: center; width: 100%">
        <p style="text-decoration: underline; font-size: 12px; flex: 3">
          Đại diện
        </p>
        <p style="font-weight: 700; flex: 1; font-size: 12px">:</p>
        <div style="flex: 15; display: flex; gap: 30px; font-size: 12px">
          <p style="font-size: 12px">${header.represent || ''}</p>
          <p style="font-size: 12px">
            ĐT: ${header.phone_number ? formatPhoneNumber(header.phone_number) :
            ''}
          </p>
          <p style="font-size: 12px">Email: ${header.email || ''}</p>
        </div>
      </div>
      <i style="font-size: 12px"
        >Căn cứ vào báo giá số………...., ${header.company || ''} gửi đến quý công
        ty đơn hàng với nội dung sau:</i
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
      ${data.map((item) => { return `
      <tr>
        <td style="font-size: 14px">${item.stt}</td>
        <td style="font-size: 14px">${item.product_name || ''}</td>
        <td style="font-size: 14px">${item.unit || ''}</td>
        <td style="color: red; font-size: 14px">
          ${item.quantity ? formatNumberWithDots(item.quantity) : ''}
        </td>
        <td style="color: red; font-size: 14px">
          ${item.price ? formatNumberWithDots(item.price) : ''}
        </td>
        <td style="font-size: 14px">
          ${item.total_money ? formatNumberWithDots(item.total_money) : ''}
        </td>
        <td style="color: red; font-size: 14px">${item.vat || ''}%</td>
        <td style="font-size: 14px">
          ${item.total_money_vat ? formatNumberWithDots(item.total_money_vat) :
          ''}
        </td>
        <td style="font-size: 14px">
          ${item.total_money_all ? formatNumberWithDots(item.total_money_all) :
          ''}
        </td>
      </tr>
      `; }).join('')}
      <tr>
        <th colspan="2" style="font-size: 14px">Tổng</th>
        <th style="font-size: 14px">Kg</th>
        <th style="font-size: 14px">
          ${sum.quantity ? formatNumberWithDots(sum.quantity) : ''}
        </th>
        <th></th>
        <th style="font-size: 14px">
          ${sum.total_money ? formatNumberWithDots(sum.total_money) : ''}
        </th>
        <th></th>
        <th style="font-size: 14px">
          ${sum.total_money_vat ? formatNumberWithDots(sum.total_money_vat) :
          ''}
        </th>
        <th style="font-size: 14px">
          ${sum.total_money_all ? formatNumberWithDots(sum.total_money_all) :
          ''}
        </th>
      </tr>
      <tr>
        <td colspan="9" style="text-align: left">
          <i style="font-size: 14px"
            >Bằng chữ: ${sum.total_money_all ?
            capitalizeWords(convertMoneyText(sum.total_money_all)) : ''}</i
          >
        </td>
      </tr>
    </table>

    <div style="display: flex; align-items: center; margin-top: 10px">
      <p style="margin: 0 8px">1</p>
      <b style="font-size: 13px">Chất lượng hàng: </b>
      <i style="font-size: 13px"
        >&nbspMới 100%, chưa qua sử dụng, chất lượng theo công bố</i
      >
    </div>
    <div style="display: flex; align-items: center">
      <p style="margin: 0 8px">2</p>
      <b style="font-size: 13px">Địa điểm giao hàng: </b>
      <i style="font-size: 13px"
        >&nbspKho bên mua, cước phí vận chuyển bên bán chịu</i
      >
    </div>
    <div style="display: flex; align-items: center">
      <p style="margin: 0 8px; font-size: 13px">3</p>
      <b style="font-size: 13px">Phương thức giao hàng: </b>
      <i style="font-size: 13px">&nbspHàng giao kg thực tế, bên mua hạ hàng</i>
    </div>
    <div style="display: flex; align-items: center">
      <p style="margin: 0 8px; font-size: 13px">4</p>
      <b style="font-size: 13px">Thời gian giao hàng: </b>
      <i style="font-size: 13px">&nbspTheo thỏa thuận của hai bên</i>
    </div>
    <div style="display: flex; align-items: center">
      <p style="margin: 0 8px; font-size: 13px">5</p>
      <b style="font-size: 13px">Thanh toán: </b>
      <i style="font-size: 13px">&nbspThanh toán 100% ngay khi đặt hàng</i>
    </div>
    <div style="display: flex; align-items: center">
      <p style="margin: 0 8px; font-size: 13px">6</p>
      <b style="font-size: 13px">Thời hạn báo giá:</b>
      <i style="font-size: 13px">&nbspHết ngày 30/03/2025</i>
    </div>
    <p style="text-align: center">
      <b
        ><i style="font-size: 13px"
          >Rất mong nhận được sự hợp tác của Quý công ty</i
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
  </body>
</html>`;
};
