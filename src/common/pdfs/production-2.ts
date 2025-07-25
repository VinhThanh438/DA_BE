import { logoLeft } from '@config/app.constant';

export const production2PDF = (data: any): string => {
    return `
        <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Phiếu nhập thành phẩm</title>
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
      padding: 5px;
      text-align: center;
      font-size: 12px;
    }
  </style>

  <body style="padding: 0 20px">
    <div id="order">
      <div
        style="display: flex; gap: 20px; align-items: center; padding: 0 20px"
      >
        <div style="display: flex; flex-direction: column; align-items: center">
          <img style="height: 100px" src="${logoLeft}" />
        </div>
        <div style="display: flex; align-items: left; flex-direction: column">
          <p style="font-weight: 600; font-size: 15px">
            ${data.company || ''}
          </p>
          <p style="font-size: 12px; font-weight: 600">
            ĐT: 024 3968 6769 - Fax: 024 3968 2486
          </p>
          <div style="display: flex; align-items: center; width: 100%">
            <p style="flex: 4; font-size: 13px">Lệnh sản xuất số</p>
            <p style="flex: 1; font-size: 13px">:</p>
            <p style="flex: 2; font-size: 13px; color: red">12345</p>
          </div>
        </div>
        <div style="width: 45%">
          <p style="text-align: center; font-size: 22px">LỆNH SẢN XUẤT</p>
          <p style="text-align: center; font-size: 10px; color: red">
            Thép rút
          </p>
          <div style="display: flex; text-align: right; width: 100%">
            <p style="flex: 3; font-size: 13px">Mã khách hàng</p>
            <p style="flex: 1; font-size: 13px">:</p>
            <p style="flex: 2; font-size: 13px; font-weight: 700">TK-VN</p>
            <i style="flex: 5; font-size: 13px"> ngày... tháng ... năm 20.. </i>
          </div>
        </div>
      </div>

      <table style="width: 100%">
        <tr>
          <th rowspan="2">STT</th>
          <th rowspan="2">Nội dung</th>
          <th colspan="4">Quy cách</th>
          <th rowspan="2" colspan="2">Đóng bó</th>
          <th colspan="2">Số lượng</th>
          <th rowspan="2">Phôi</th>
        </tr>
        <tr>
          <th>Φ</th>
          <th>Dung sai Φ</th>
          <th>Kích thước</th>
          <th>Dung sai cắt</th>
          <th rowspan="1">Cuộn, bó</th>
          <th rowspan="1">Kg</th>
        </tr>
        <tr>
          <td>1</td>
          <td>Thép rút Φ 7</td>
          <td style="color: red">7</td>
          <td style="color: red">6.9 - 7.0</td>
          <td style="color: red">x</td>
          <td style="color: red">x</td>
          <td style="color: red">Cuộn / kg</td>
          <td style="color: red">300</td>
          <td>20</td>
          <td style="color: red">6,000.00</td>
          <th>8</th>
        </tr>

        <!-- tiến độ -->
        <tr>
          <th colspan="1">Tiến độ</th>
          <th colspan="7"></th>
          <th colspan="1">Tổng</th>
          <th colspan="2">100,100</th>
        </tr>

        <tr>
          <th rowspan="1" colspan="1">Nguồn phối</th>
          <th colspan="1">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="1">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="1">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="1">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="1" rowspan="2">Tổng</th>
          <th colspan="1" rowspan="2" style="color: red">12,872</th>
        </tr>
        <tr>
          <th colspan="1">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="1">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="1">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="1">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>

        <tr>
          <th rowspan="2" colspan="1" style="height: 60px">Ghi chú</th>
          <th colspan="10"></th>
        </tr>
        <tr>
          <th colspan="10"></th>
        </tr>
      </table>

      <div
        style="
          display: flex;
          justify-content: space-between;
          text-align: center;
          margin-top: 40px;
        "
      >
        <div style="flex: 1">
          <b>BỘ PHẬN TIẾP NHẬN</b>
        </div>
        <div style="flex: 1">
          <b>KỸ THUẬT</b>
        </div>
        <div style="flex: 1">
          <b>BỘ PHẬN BÁN HÀNG</b>
        </div>
      </div>
    </div>
  </body>
</html>`;
};
