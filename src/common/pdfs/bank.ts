export const bankPDF = (type: any, data: any[], sum: any) => {
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
        <h2>Công ty TNHH SX TM Thép Đông Anh</h2>
        <div style="display: flex; width: 100vw; align-items: center">
            <div style="flex: 1">Nhật ký giao dịch ${type === 'mb' ? 'ngân hàng MB Bank' : type === 'bidv' ? 'ngân hàng BIDV' : 'Qũy tiền mặt'}</div>
            <h1 style="flex: 1; text-align: center">${type === 'mb' ? 'MB Bank' : type === 'bidv' ? 'BIDV' : 'Sổ  Qũy'}</h1>
        </div>
        <div>Đơn vị: VNĐ</div>
        <table>
            <tr>
                <th rowspan="2">STT</th>
                <th rowspan="2">Ngày</th>
                <th rowspan="2">Nội dung</th>
                <th rowspan="2">Mã khách hàng</th>
                <th colspan="2">Số dư đầu kỳ</th>
                <th>500000000</th>
            </tr>
            <tr>
                <th>Phát sinh có</th>
                <th>Phát sinh nợ</th>
                <th>Số dư</th>
            </tr>
                ${data.map((item) => {
                    return `<tr>
                    <td>${item.id}</td>
                    <td>${item.date}</td>
                    <td>${item.content}</td>
                    <td>${item.code}</td>
                    <td>${item.arise}</td>
                    <td>${item.debt}</td>
                    <td>${item.balance}</td>
                    </tr>`;
                })}
            <tr>
                <td colspan="4">Tổng</td>
                <td>${sum.sumArise}</td>
                <td>${sum.sumDebt}</td>
                <td>${sum.sumBalance}</td>
            </tr>
            <tr>
                <td colspan="7" style="text-align: left">Số dư bằng chữ:</td>
            </tr>
        </table>
    </body>
</html>
`;
};
