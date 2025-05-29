import { formatNumberWithDots } from '@common/helpers/format-number-with-dots';
import { formatPhoneNumber } from '@common/helpers/formatPhoneNumber';
import { TimeHelper } from '@common/helpers/time.helper';
import { logoLeft } from '@config/app.constant';

export const importWarehousePDF = (data: any) => {
    let sumQty = 0;
    let sumRealQty = 0;
    let sumPrice = 0;
    let sumTotalMoney = 0;
    const vat = 10;
    return `<!doctype html>
<html lang="en">
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
            box-sizing: border-box;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid black;
        }
        th,
        td, tr {
            border: 1px solid black;
            padding: 10px;
            text-align: center;
        }
    </style>
    <body>
        <div style="padding: 0 18px; width: 80%">
            <div style="display: flex; align-items: center">
                <div style="width: 25%; display: flex; flex-direction: column; align-items: center;">
                    <img
                        style="height: 100px"
                        src=${logoLeft}
                    />
                    <p>ISO 9001:2015</p>
                </div>
                <div style="flex: 1">
                    <h2>${data?.organization?.name || ''}</h2>
                    <p>Địa chỉ: ${data?.organization?.address || ''}</p>
                    <p>Điện thoại: ${data?.organization?.phone ? formatPhoneNumber(data?.organization?.phone) : ''} – Hotline: ${data?.organization?.phone ? formatPhoneNumber(data?.organization?.hotline) : ''}</p>
                    <p>Mã số thuế: ${data?.organization?.tax_code || ''}</p>
                    <p>Tài khoản: 2141.0000.378769 – NH Đầu tư và PT Đông Hà Nội</p>
                </div>
            </div>
        </div>
        <hr />
        <div style="display: flex; align-items: flex-start; position: relative">
            <h1 style="flex: 1; text-align: center">Phiếu Nhập Kho</h1>
            <div style="text-align: center; position: absolute; right: 0">
                <p style="color: red">Số: 10098</p>
                <p>Ngày: ${TimeHelper.format(new Date(), 'DD-MM-YYYY')}</p>
            </div>
        </div>
        <p>- Căn cứ vào Báo giá / Đơn đặt hàng / Hợp đồng số ... Ngày ... tháng ... năm ...</p>
        <p>- Căn cứ vào lệnh điều động số ... Ngày ... tháng ... năm ... Của...</p>
        <b>Đơn vị giao hàng: ${data?.delivery?.name || ''}</b>
        <div style="display: flex; align-items: center">
            <b style="flex: 1">Đại diện giao hàng: ${data?.representative_name || ''}</b>
            <p style="flex: 1">CCCD số: ${data?.identity_code || ''}</p>
            <p style="flex: 1">Giấy ủy quyền số: ........</p>
        </div>
        <div style="display: flex; align-items: center">
            <b style="flex: 1">Phương tiện vận chuyển: ${data?.vehicle || ''}</b>
            <p style="flex: 1">Biển kiểm soát: ${data?.plate || ''}</p>
            <p style="flex: 1">Xe thuê / Xe nhà / Xe khách</p>
        </div>
        <div style="display: flex; align-items: center">
            <b style="flex: 1">Nhập tại kho: ............</b>
            <p style="flex: 1">Xuất tại kho: ............</p>
            <p style="flex: 1">Thủ kho: ............</p>
        </div>
        </br>
        <table>
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
            ${(data?.details || []).map((item: any, index: number) => {
                sumQty += item?.quantity || 0;
                sumRealQty += item?.real_quantity || 0;
                const total_price =
                    item?.quantity && item?.order_detail?.price ? item?.quantity * item?.order_detail?.price : 0;
                sumTotalMoney += total_price;
                return `<tr>
                    <td>${index + 1}</td>
                    <td>${item?.order_detail?.product?.name || ''}</td>
                    <td>${item?.order_detail?.product?.code || ''}</td>
                    <td>0000</td>
                    <td>${item?.order_detail?.unit?.name || ''}</td>
                    <td>${item?.quantity ? formatNumberWithDots(item?.quantity) : ''}</td>
                    <td>${item?.real_quantity ? formatNumberWithDots(item?.real_quantity) : ''}</td>
                    <td>${item?.order_detail?.price ? formatNumberWithDots(item?.order_detail?.price) : ''}</td>
                    <td>${formatNumberWithDots(total_price)}</td>
                </tr>`;
            }).join('')}
            <tr>
                <td colspan="5" rowspan="3">Đề nghị kiểm tra, đối chiếu kỹ trước khi ký phiếu</td>
                <td>${sumQty ? formatNumberWithDots(sumQty) : ''}</td>
                <td>${sumRealQty ? formatNumberWithDots(sumRealQty) : ''}</td>
                <td>Tổng</td>
                <td>${sumTotalMoney ? formatNumberWithDots(sumTotalMoney) : ''}</td>
            </tr>
            <tr>
                <td colspan="2">Thuế VAT</td>
                <td>Fake: ${vat}</td>
                <td>${formatNumberWithDots((sumTotalMoney * 10) / 100)}</td>
            </tr>
            <tr>
                <td colspan="3">Tổng cộng có VAT</td>
                <td>${formatNumberWithDots((sumTotalMoney * 10) / 100 + sumTotalMoney)}</td>
            </tr>
        </table>
        <br />
        <div style="display: flex; align-items: flex-start; justify-content: space-evenly">
            <div style="text-align: center">
                <b>Phụ trách bộ phận</b>
                <p>(Ký, ghi rõ họ tên)</p>
            </div>
            <div style="text-align: center">
                <b>Thử kho</b>
                <p>(Ký, ghi rõ họ tên)</p>
            </div>
            <div style="text-align: center">
                <b>Kế toán trưởng</b>
                <p>(Ký, ghi rõ họ tên)</p>
            </div>
            <div style="text-align: center">
                <b>Giám đốc</b>
                <p>(Ký, ghi rõ họ tên)</p>
            </div>
        </div>
    </body>
</html>
`;
};
