export const paymentHeaderDPF = (startAt: string, endAt: string, data: any[], sum: any) => {
    return `<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta
            name="viewport"
            content="width=
    , initial-scale=1.0"
        />
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
        <h3>CÔNG TY TNHH SX TM THÉP ĐÔNG ANH</h3>
        <h1 style = "text-align: center">BÁO CÁO CÔNG NỢ PHẢI TRẢ</h1>
        <div style=" display: flex; justify-content: center; justify-content: space-between">
            <div style=" display: flex; justify-content: center;">
                <p style="margin: 0 40px">Từ ngày: ${startAt}</p>
                <p style="margin: 0 40px">Đến ngày: ${endAt}</p>
            </div>
            <div>
                Đvt: VNĐ
            </div>
        </div>
        <br/>
        <table>
            <tr>
                <th rowspan="2">STT</th>
                <th rowspan="2">Mã khách hàng</th>
                <th rowspan="2">Tên khách hàng</th>
                <th rowspan = "1">Loại hàng hóa</th>
                <th rowspan = "1">Phải trả đầu kỳ</th>
                <th rowspan = "1">Phải trả tăng</th>
                <th rowspan = "1">Phải trả giảm</th>
                <th rowspan = "1">Phải trả cuối kỳ</th>
                <th rowspan = "1">Đến hạn phải trả</th>
                <th rowspan = "1">Đề nghị thanh toán</th>
                <th rowspan="2">Duyệt thanh toán</th>
            </tr>
            <tr>
                <th>Tổng</th>
                <th>${sum.sumPayStart}</th>
                <th>${sum.sumPayUp}</th>
                <th>${sum.sumPayDowm}</th>
                <th>${sum.sumPayEnd}</th>
                <th>0</th>
                <th>0</th>
            </tr>
            
            ${data.map((item) => {
                return `<tr><td>${item.id}</td> 
                        <td style="text-align: left">${item.code}</td> 
                        <td style="text-align: left">${item.partner}</td>
                        <td style="text-align: left">${item.type}</td>
                        <td style="text-align: right">${item.payStart}</td>
                        <td style="text-align: right">${item.payUp}</td>
                        <td style="text-align: right">${item.payDown}</td>
                        <td style="text-align: right">${item.payEnd}</td>
                        <td style="text-align: right">${item.paymentDue}</td>
                        <td style="text-align: right">${item.payRequest}</td>
                        <td style="text-align: right">${item.payApproval}</td>
                        </tr>`;
            })}
        </table>
    </body>
</html>
`;
};
