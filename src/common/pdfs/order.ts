export const orderPDF = (data: any[], header: any, sum: any) => {
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
        <div style="padding: 0 18px;">
            <div style="display: flex; align-items: center">
                <div style="width: 25%; display: flex; flex-direction: column; align-items: center;">
                    <img
                        style="height: 100px"
                        src=${header.logo}
                    />
                    <p>ISO 9001:2015</p>
                </div>
                <div style="flex: 1">
                    <h2>${header.company}</h2>
                    <div style="display: flex; align-items: center; justify-content: space-between">
                        <div>
                            <p>Địa chỉ: ${header.address}</p>
                            <p>${header.cotact}</p>
                            <p>${header.tax_code}</p>
                        </div>
                        <img
                            style="height: 80px"
                            src=${header.logo}
                        />
                    </div>
                </div>
            </div>
        </div>
        <hr />
        <div style="display: flex">
            <div style="padding: 0 18px;">
                <div style="display: flex; align-items: center; justify-content: space-between">
                    <p>Số: 010325 ĐA/DA</p>
                    <i>${header.time_at}</i>
                </div>
                <h1 style="text-align: center">ĐƠN ĐẶT HÀNG</h1>
                <p style="font-weight: 800">
                    <span style="text-decoration: underline">Tên nhà cung cấp</span>: ${header.partner_name}
                </p>
                <p>Địa chỉ: ${header.oAddress}</p>
                <div style="display: flex; align-items: center">
                    <p style="flex: 1">Đại diện: ${header.represent}</p>
                    <p style="flex: 1">ĐT: ${header.phone_number}</p>
                    <p style="flex: 1">Email: ${header.email}</p>
                </div>
                <i
                    >Căn cứ vào báo giá số………...., ${header.note} gửi đến quý công ty đơn hàng với nội
                    dung sau:</i
                >
            </div>
            <div style="flex: 1; align-content: end;">
                <h2 style="text-align: center">Hoa hồng</h2>
                <p><b>${header.commission_name}</b></p>
                <p>Tài khoản: ${header.commission_account}</p>
                <p>Số điện thoại: 123456789</p>
            </div>
        </div>
        <table>
            <tr>
                <th rowspan="2">STT</th>
                <th rowspan="2">Tên hàng và quy cách</th>
                <th rowspan="2">Đvt</th>
                <th rowspan="2">Số lượng</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
                <th colspan="2">VAT</th>
                <th>Tổng tiền</th>
                <th rowspan="2">Hoa hồng cho người bán</th>
                <th>Thành tiền</th>
            </tr>
            <tr>
                <th>Vnđ</th>
                <th>Vnđ</th>
                <th>%</th>
                <th>Vnđ</th>
                <th>Vnđ</th>
                <th>Dự kiến</th>
            </tr>
            ${data.map((item) => {
                return `<tr>
                    <td>${item.stt}</td>
                    <td>${item.product_name}</td>
                    <td>${item.unit}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price}</td>
                    <td>${item.total_money}</td>
                    <td>${item.vat}%</td>
                    <td>${item.total_money_vat}</td>
                    <td>${item.total_money_all}</td>
                    <td>${item.commission_vat}%</td>
                    <td>${item.commission_money}</td>
                </tr>`;
            })}
            <tr>
                <th colspan="2">Tổng</th>
                <th>Kg</th>
                <th>${sum.quantity}</th>
                <th></th>
                <th>${sum.total_money}</th>
                <th></th>
                <th>${sum.total_money_vat}</th>
                <th>${sum.total_money_all}</th>
                <th>${sum.commission_vat}%</th>
                <th>${sum.commission_money}</th>
            </tr>
            <tr>
                <td colspan="9" style="text-align: left"><i>Bằng chữ:</i></td>
            </tr>
        </table>
        <div style="display: flex; align-items: center">
            <p style="margin: 0 8px">1</p>
            <b>Chất lượng hàng: </b>
            <i>&nbspMới 100%, chưa qua sử dụng, chất lượng theo công bố</i>
        </div>
        <div style="display: flex; align-items: center">
            <p style="margin: 0 8px">2</p>
            <b>Địa điểm giao hàng: </b>
            <i>&nbspKho bên mua, cước phí vận chuyển bên bán chịu</i>
        </div>
        <div style="display: flex; align-items: center">
            <p style="margin: 0 8px">3</p>
            <b>Phương thức giao hàng: </b>
            <i>&nbspHàng giao kg thực tế, bên mua hạ hàng</i>
        </div>
        <div style="display: flex; align-items: center">
            <p style="margin: 0 8px">4</p>
            <b>Thời gian giao hàng: </b>
            <i>&nbspTheo thỏa thuận của hai bên</i>
        </div>
        <div style="display: flex; align-items: center">
            <p style="margin: 0 8px">5</p>
            <b>Thanh toán: </b>
            <i>&nbspThanh toán 100% ngay khi đặt hàng</i>
        </div>
        <div style="display: flex; align-items: center">
            <p style="margin: 0 8px">6</p>
            <b>Thời hạn báo giá:</b>
            <i>&nbspHết ngày 30/03/2025</i>
        </div>
        <p style="text-align: center">
            <b><i>Rất mong nhận được sự hợp tác của Quý công ty</i></b>
        </p>
        <div style="display: flex; align-items: center">
            <h3 style="flex: 1; text-align: center">XÁC NHẬN CỦA KHÁCH HÀNG</h3>
            <h3 style="flex: 1; text-align: center">CT.TNHH SX TM THÉP ĐÔNG ANH</h3>
        </div>
    </body>
</html>
`;
};
