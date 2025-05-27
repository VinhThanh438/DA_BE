import { IDataImportWarehousePDF } from '@common/interfaces/warehouse.interface';

export const importWarehousePDF = (data: IDataImportWarehousePDF[], sum: any) => {
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
    <body>
        <div style="padding: 0 18px; width: 80%">
            <div style="display: flex; align-items: center">
                <div style="width: 25%; display: flex; flex-direction: column; align-items: center;">
                    <img
                        style="height: 100px"
                        src="https://www.techsmith.com/blog/wp-content/uploads/2022/03/resize-image.png"
                    />
                    <p>ISO 9001:2015</p>
                </div>
                <div style="flex: 1">
                    <h2>Công ty TNHH Sản Xuất Và Thương mại Thép Đông Anh</h2>
                    <p>Địa chỉ: Tổ 28 – Thị trấn Đông Anh - Hà Nội</p>
                    <p>Điện thoại: 0243.968.6769 – Hotline: 0978.993.999</p>
                    <p>Mã số thuế: 0102378256</p>
                    <p>Tài khoản: 2141.0000.378769 – NH Đầu tư và PT Đông Hà Nội</p>
                </div>
            </div>
        </div>
        <hr />
        <div style="display: flex; align-items: flex-start; position: relative">
            <h1 style="flex: 1; text-align: center">Phiếu Nhập Kho</h1>
            <div style="text-align: center; position: absolute; right: 0">
                <p style="color: red">Số: 10098</p>
                <p>Ngày: 20-03-2025</p>
            </div>
        </div>
        <p>- Căn cứ vào Báo giá / Đơn đặt hàng / Hợp đồng số ... Ngày ... tháng ... năm ...</p>
        <p>- Căn cứ vào lệnh điều động số ... Ngày ... tháng ... năm ... Của...</p>
        <b>Đơn vị giao hàng: CÔNG TY TNHH ĐẤT VIỆT</b>
        <div style="display: flex; align-items: center">
            <b style="flex: 1">Đại diện giao hàng: Trần Văn Anh</b>
            <p style="flex: 1">CCCD số: 123456789</p>
            <p style="flex: 1">Giấy ủy quyền số: ........</p>
        </div>
        <div style="display: flex; align-items: center">
            <b style="flex: 1">Phương tiện vận chuyển: Xe tải</b>
            <p style="flex: 1">Biển kiểm soát: 29C-12345</p>
            <p style="flex: 1">Xe thuê / Xe nhà / Xe khách</p>
        </div>
        <div style="display: flex; align-items: center">
            <b style="flex: 1">Nhập tại kho: ............</b>
            <p style="flex: 1">Xuất tại kho: ............</p>
            <p style="flex: 1">Thủ kho: ............</p>
        </div>
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
                <th colspan="2">Đưa vào chi phí phát sinh</th>
            </tr>
            <tr>
                <td>Chứng từ</td>
                <td>Thực nhận</td>
                <td>Kg chênh lệch</td>
                <td>Thành tiền chênh lệch</td>
            </tr>
            ${data.map((item) => {
                return `<tr>
                    <td>${item.id}</td>
                    <td>${item.product_name}</td>
                    <td>${item.product_code}</td>
                    <td>${item.unit}</td>
                    <td>${item.unit_name}</td>
                    <td>${item.document}</td>
                    <td>${item.real}</td>
                    <td>${item.price}</td>
                    <td>${item.total_price}</td>
                    <td>${item.kg}</td>
                    <td>${item.money}</td>
                </tr>`;
            })}
            <tr>
                <td colspan="5" rowspan="3">Đề nghị kiểm tra, đối chiếu kỹ trước khi ký phiếu</td>
                <td>${sum.document}</td>
                <td>${sum.real_price}</td>
                <td>Tổng</td>
                <td>${sum.total_price}</td>
                <td>${sum.kg}</td>
                <td>${sum.money}</td>
            </tr>
            <tr>
                <td colspan="2">Thuế VAT</td>
                <td>${sum.vat}%</td>
                <td>${sum.price_vat}</td>
            </tr>
            <tr>
                <td colspan="3">Tổng cộng có VAT</td>
                <td>${sum.total}</td>
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
