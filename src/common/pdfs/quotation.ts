export const quotationPDF = (data: any[], sum: any, header: any) => {
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
        <div style="padding: 0 18px">
            <div style="display: flex; align-items: center">
                <div style="width: 25%; display: flex; flex-direction: column; align-items: center;">
                    <img
                        style="height: 100px"
                        src="https://www.techsmith.com/blog/wp-content/uploads/2022/03/resize-image.png"
                    />
                    <p>ISO 9001:2015</p>
                </div>
                <div style="flex: 1">
                    <h2>CÔNG TY TNHH SX TM THÉP ĐÔNG ANH</h2>
                    <div style="display: flex; align-items: center; justify-content: space-between">
                        <div>
                            <p>Địa chỉ: Số 27, tổ 28, thị trấn Đông Anh, Hà Nội</p>
                            <p>Điện thoại: 024.39686769 – Hotline: 0978.993.999</p>
                            <p>MST: 0102378256</p>
                        </div>
                        <img
                            style="height: 80px"
                            src="https://www.techsmith.com/blog/wp-content/uploads/2022/03/resize-image.png"
                        />
                    </div>
                </div>
            </div>
        </div>
        <hr />
        <div style="padding: 0 18px">
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <p>Số: 010325 ĐA/DA</p>
                <i>${header.time_at}</i>
            </div>
            <h1 style="text-align: center">BÁO GIÁ</h1>
            <p style="font-weight: 800">
                <span style="text-decoration: underline">Tên khách hàng</span>: ${header.partner}
            </p>
            <p>Địa chỉ: ${header.address}</p>
            <div style="display: flex; align-items: center">
                <p style="flex: 1">Đại diện: ${header.representative_name}</p>
                <p style="flex: 1">ĐT: ${header.phone}</p>
                <p style="flex: 1">Email: ${header.email}</p>
            </div>
            <i>Theo nhu cầu của Quý khách hàng, ${header.note} xin được báo giá như sau:</i>
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
            </tr>
            <tr>
                <th>Vnđ</th>
                <th>Vnđ</th>
                <th>%</th>
                <th>Vnđ</th>
                <th>Vnđ</th>
            </tr>
            ${data.map((item) => {
                return `<tr>
                    <td>${item.id}</td>
                    <td>${item.product}</td>
                    <td>${item.unit}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price}</td>
                    <td>${item.intoMoney}</td>
                    <td>${item.vat}</td>
                    <td>${item.value}</td>
                    <td>${item.total}</td>
                </tr>`;
            })}
            <tr>
                <th colspan="2">Tổng</th>
                <th>Kg</th>
                <th>${sum.sumQuatity}</th>
                <th></th>
                <th>${sum.sumMoney}</th>
                <th></th>
                <th>${sum.sumVat}</th>
                <th>${sum.total}</th>
            </tr>
            <tr>
                <td colspan="9" style="text-align: left"><i>Bằng chữ:</i></td>
            </tr>
        </table>
        <div style="display: flex; align-items: flex-start">
            <p style="margin: 0 8px">1</p>
            <b>Chất lượng hàng: </b>
            <div>
                <p><i>&nbsp+ Đạt giới hạn bền ≥ 300 Mpa</i></p>
                <p><i>&nbsp+ Dung lượng đường kính theo TCVN 9391:2012</i></p>
            </div>
        </div>
        <div style="display: flex; align-items: center">
            <p style="margin: 0 8px">2</p>
            <b>Địa điểm giao hàng: </b>
            <i>&nbspKCN Bá Thiện - Vĩnh Phúc</i>
        </div>
        <div style="display: flex; align-items: center">
            <p style="margin: 0 8px">3</p>
            <b>Phương thức giao hàng: </b>
            <i>&nbspHàng giao theo m2, bên mua hạ hàng</i>
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
            <b>Thời hạn báo giá: </b>
            <i>&nbspHết ngày 30/03/2025</i>
        </div>
       <p style="text-align: center"><b><i>Rất mong nhận được sự hợp tác của Quý công ty</i></b></p>
        <div style="display: flex; align-items: center">
            <h3 style="flex: 1; text-align: center">XÁC NHẬN CỦA KHÁCH HÀNG</h3>
            <h3 style="flex: 1; text-align: center">CT.TNHH SX TM THÉP ĐÔNG ANH</h3>
        </div>
    </body>
</html>
`;
};
