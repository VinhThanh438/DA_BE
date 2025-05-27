export const debtComparisonPDF = (data: any[], sum: any, header: any) => {
    return `<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
    </head>
    <style>
        *{
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
        <div style="display: flex; align-items: center">
            <h3 style="flex: 1; text-align: center">CÔNG TY TNHH SX TM THÉP ĐÔNG ANH</h3>
            <h3 style="flex: 1; text-align: center">CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3>
        </div>
        <div style="display: flex; align-items: center">
            <h3 style="flex: 1; text-align: center">Số: 123456</h3>
            <h3 style="flex: 1; text-align: center">Độc lập_Tự do_Hạnh phúc</h3>
        </div>
        <h1 style="text-align: center">${header.title}</h1>
        <p style="font-style: italic; margin-left: 18px">- Căn cứ vào biên bản giao nhận hàng hoá</p>
        <p style="font-style: italic; margin-left: 18px">- Căn cứ vào thoả thuận giữa hai bên</p>
        <p style="font-style: italic">
            Hôm nay ngày….tháng…năm 2025 tại trụ sở Công ty thép Đông Anh, chúng tôi gồm có
        </p>
        <h3>I. Bên mua (Bên A): CÔNG TY TNHH SX TM THÉP ĐÔNG ANH</h3>
        <div style="display: flex; align-items: center">
            <p style="flex: 1">Địa chỉ:</p>
            <p style="flex: 1">Điện thoại:</p>
        </div>
        <div style="display: flex; align-items: center">
            <p style="flex: 1">Đại diện: Lê Văn Công</p>
            <p style="flex: 1">Chức vụ: Giám đốc</p>
        </div>
        <div style="display: flex; align-item: center">
            <h3 style="flex: 1">I. Bên bán (Bên B): CÔNG TY CP Hoà Phát</h3>
            <p style="flex: 1">Mã KH: HP123</p>
        </div>
        <div style="display: flex; align-items: center">
            <p style="flex: 1">Địa chỉ:</p>
            <p style="flex: 1">Điện thoại:</p>
        </div>
        <div style="display: flex; align-items: center">
            <p style="flex: 1">Đại diện: Trần Văn Long</p>
            <p style="flex: 1">Chức vụ: Giám đốc</p>
        </div>
        <p style="margin-left: 18px">Cùng nhau đối chiếu công nợ giữa hai bên với số liệu như sau:</p>
        <p style="margin-left: 18px">Công nợ đầu kỳ: 200000000</p>
        <p style="margin-left: 18px">Công nợ phát sinh trong kỳ:</p>
        <table>
            <tr>
                <th rowspan="2">STT</th>
                <th rowspan="2">Ngày</th>
                <th rowspan="2">Số HĐ VAT</th>
                <th rowspan="2">Nội dung</th>
                <th>Thành tiền</th>
                <th colspan="3">Thanh toán</th>
                <th>Còn nợ</th>
                <th rowspan="2">Số HĐ</th>
                <th rowspan="2">Đề nghị thanh toán</th>
            </tr>
            <tr>
                <th>Vnđ</th>
                <th>Số tiền</th>
                <th>Ngày</th>
                <th>Ngân hàng</th>
                <th>Vnđ</th>
            </tr>
            ${data.map((item) => {
                return `<tr>
                    <td>${item.id}</td>
                    <td>${item.date}</td>
                    <td>${item.vat}</td>
                    <td>${item.content}</td>
                    <td>${item.intoMoney}</td>
                    <td>${item.money}</td>
                    <td>${item.paymentDate}</td>
                    <td>${item.bank}</td>
                    <td>${item.debt}</td>
                    <td>${item.orderNumber}</td>
                    <td>${item.payRequest}</td>
                </tr>`;
            })}
            <tr style="font-weight: 800">
                <td colspan="4">Tổng</td>
                <td>${sum.sumIntoMoney}</td>
                <td>${sum.sumMoney}</td>
                <td></td>
                <td></td>
                <td>${sum.sumDebt}</td>
                <td></td>
                <td>${sum.sumPayRequest}</td>
            </tr>
            <tr>
                <td colspan="12" style="text-decoration: underline; font-weight: 800; text-align: left">Bằng chữ:</td>
            </tr>
        </table>
        <p>
            Biên bản này được lập thành 02 bản có giá trị như nhau. Mỗi bên giữ 01 bản làm cơ sở cho việc thanh toán sau
            này giữa hai bên. trong vòng 03 ngày làm việc kể từ ngày nhận được biên bản đối chiếu công nợ này mà bên B
            không nhận được phản hồi từ quý công ty thì công nợ trên coi như được chấp nhận
        </p>
        <br />
        <div style="display: flex; align-items: center; font-weight: 800">
            <p style="flex: 1; text-align: center">ĐẠI DIỆN BÊN A</p>
            <p style="flex: 1; text-align: center">ĐẠI DIỆN BÊN B</p>
        </div>
    </body>
</html>
`;
};
