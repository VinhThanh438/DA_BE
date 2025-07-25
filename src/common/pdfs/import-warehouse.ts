import { formatNumberWithDots } from '@common/helpers/format-number-with-dots';
import { formatPhoneNumber } from '@common/helpers/formatPhoneNumber';
import { TimeAdapter } from '@common/infrastructure/time.adapter';
import { IInventoryPDF } from '@common/interfaces/inventory.interface';
import { logoLeft } from '@config/app.constant';

export const importWarehousePDF = (data: IInventoryPDF) => {
    let sumQty = 0;
    let sumRealQty = 0;
    let sumPrice = 0;
    let sumTotalMoney = 0;
    const vat = 10;
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
      width: 99%;
      border-collapse: collapse;
      border: 1px solid black;
    }
    th,
    td {
      border: 1px solid black;
      padding: 5px;
      text-align: center;
    }
  </style>

  <body style="padding: 0 20px; font-family: 'Times New Roman', Times, serif">
    <div id="order">
      <div
        style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 18px;
        "
      >
        <div style="display: flex; flex-direction: column; align-items: center">
          <img style="height: 80px" src="${logoLeft}" />
          <p style="font-weight: 700; font-size: 12px">ISO 9001:2015</p>
        </div>
        <div style="display: flex; flex-direction: column">
          <p style="font-weight: 700; font-size: 14px">
            ${data?.organization?.name || ''}
          </p>
          <div style="display: flex; align-items: flex-start; gap: 20px">
            <div style="display: flex; flex-direction: column">
              <p style="font-size: 14px">
                Địa chỉ: ${data?.organization?.address || ''}
              </p>
              <p style="font-size: 14px">
                Điện thoại: ${data?.organization?.phone ? formatPhoneNumber(data?.organization?.phone) : ''} – Hotline:
                ${data?.organization?.phone ? formatPhoneNumber(data?.organization?.hotline as string) : ''}
              </p>
              <p style="font-size: 14px">
                Mã số thuế: ${data?.organization?.tax_code || ''}
              </p>
            </div>
          </div>
        </div>
        <div style="width: 1px"></div>
      </div>
      <hr style="margin-bottom: 1px" />
      <hr />
      <div style="display: flex; align-items: flex-start; position: relative">
        <i style="flex: 3"
          >Ngày ${TimeAdapter.format(new Date(), 'DD-MM-YYYY')}</i
        >
        <p
          style="
            flex: 4;
            text-align: center;
            font-weight: 700;
            font-size: 22px;
            margin-top: 2%;
          "
        >
          PHIẾU NHẬP KHO
        </p>
        <p style="color: red; flex: 3; text-align: right">Số: 10098</p>
      </div>

      <div style="font-size: 12px">
        <div style="display: flex">
          <i style="flex: 4"
            >- Căn cứ vào Báo giá / Đơn đặt hàng / Hợp đồng số:
          </i>
          <p style="color: red; flex: 4; text-align: center">12345</p>
          <p style="flex: 3">Ngày ... tháng ... năm 2025</p>
        </div>
        <div style="display: flex; margin-top: 5px">
          <i style="flex: 2">- Căn cứ vào lệnh điều động số: </i>
          <p style="color: red; flex: 2; text-align: center">12345</p>
          <p style="flex: 4">
            Ngày ... tháng ... năm 2025,
            của..........................................
          </p>
        </div>
      </div>
      <div style="display: flex; margin-top: 1%">
        <p
          style="
            font-size: 14px;
            flex: 2;
            text-decoration: underline;
            font-weight: 600;
          "
        >
          Đơn vị giao hàng:
        </p>
        <p style="flex: 4">${data?.shipping_plan?.partner?.name || ''}</p>
      </div>

      <div style="display: flex; align-items: center; font-size: 14px">
        <p style="flex: 1; font-size: 14px">
          Đại diện giao hàng: ${data?.representative_name || ''}
        </p>
        <div style="flex: 1; display: flex">
          <p>CCCD số:</p>
          <p style="color: red">&nbsp${data?.identity_code || ''}</p>
        </div>

        <p style="flex: 1">Giấy ủy quyền số: ........</p>
      </div>
      <div style="display: flex; align-items: center; font-size: 14px">
        <p style="flex: 1">Phương tiện vận chuyển: Ô tô</p>
        <p style="flex: 1">Biển kiểm soát: 29C-12345</p>
        <p style="flex: 1">Xe thuê / Xe nhà / Xe khách</p>
      </div>
      <div style="display: flex; align-items: center; font-size: 14px">
        <p style="flex: 1">Nhập tại kho: ..........................</p>
        <p style="flex: 1; text-align: center"></p>
        <p style="flex: 1">Thủ kho:</p>
      </div>

      <table style="font-size: 12px">
        <tr>
          <th rowspan="2">STT</th>
          <th rowspan="2">Hàng hóa và quy cách</th>
          <th rowspan="2">Mã hàng</th>
          <th rowspan="2">Đơn vị</th>
          <th rowspan="2">Đvt</th>
          <th colspan="2">Số lượng</th>
          <th rowspan="2">Đơn giá (vnđ)</th>
          <th rowspan="2">Thành tiền (vnđ)</th>
        </tr>
        <tr>
          <td>Chứng từ</td>
          <td>Thực nhận</td>
        </tr>
        ${(data?.details || [])
            .map((item: any, index: number) => {
                sumQty += item?.quantity || 0;
                sumRealQty += item?.real_quantity || 0;
                const total_price =
                    item?.quantity && item?.order_detail?.price ? item?.quantity * item?.order_detail?.price : 0;
                sumTotalMoney += total_price;
                return `
        <tr>
          <td>${index + 1}</td>
          <td>${item?.order_detail?.product?.name || ''}</td>
          <td>${item?.order_detail?.product?.code || ''}</td>
          <td></td>
          <td>${item?.order_detail?.unit?.name || ''}</td>
          <td>${item?.quantity ? formatNumberWithDots(item?.quantity) : ''}</td>
          <td style="color: red">
            ${item?.real_quantity ? formatNumberWithDots(item?.real_quantity) : ''}
          </td>
          <td>
            ${item?.order_detail?.price ? formatNumberWithDots(item?.order_detail?.price) : ''}
          </td>
          <td>${formatNumberWithDots(total_price)}</td>
        </tr>
        `;
            })
            .join('')}
        <tr>
          <td colspan="5" rowspan="3">
            Đề nghị kiểm tra, đối chiếu kỹ trước khi ký phiếu
          </td>
          <td>${sumQty ? formatNumberWithDots(sumQty) : ''}</td>
          <td>${sumRealQty ? formatNumberWithDots(sumRealQty) : ''}</td>
          <td>Tổng</td>
          <td>${sumTotalMoney ? formatNumberWithDots(sumTotalMoney) : ''}</td>
        </tr>
        <tr>
          <td colspan="2">Thuế VAT</td>
          <td style="color: red">Fake: ${vat}</td>
          <td>${formatNumberWithDots((sumTotalMoney * 10) / 100)}</td>
        </tr>
        <tr>
          <td colspan="3">Tổng cộng có VAT</td>
          <td style="color: red">
            ${formatNumberWithDots((sumTotalMoney * 10) / 100 + sumTotalMoney)}
          </td>
        </tr>
      </table>
      <p style="text-align: center">
        <b
          ><i style="font-size: 13px"
            >&nbspRất mong nhận được sự hợp tác của Quý công ty</i
          ></b
        >
      </p>
      <br />
      <div
        style="
          display: flex;
          align-items: flex-start;
          justify-content: space-evenly;
        "
      >
        <div style="text-align: center; font-size: 12px">
          <b>Người nhận hàng</b>
          <p>(Ký, ghi rõ họ tên)</p>
        </div>
        <div style="text-align: center; font-size: 12px">
          <b>Phụ trách bộ phận</b>
          <p>(Ký, ghi rõ họ tên)</p>
        </div>
        <div style="text-align: center; font-size: 12px">
          <b>Thủ kho</b>
          <p>(Ký, ghi rõ họ tên)</p>
        </div>
        <div style="text-align: center; font-size: 12px">
          <b>Kế toán trưởng</b>
          <p>(Ký, ghi rõ họ tên)</p>
        </div>
        <div style="text-align: center; font-size: 12px">
          <b>Giám đốc</b>
          <p>(Ký, ghi rõ họ tên)</p>
        </div>
      </div>
    </div>
  </body>
</html>
`;
};
