export const paymentCommissionDPF = (startAt: string, endAt: string, data: any[], sum: any) => {
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
        <h2>CÔNG TY TNHH SX TM THÉP ĐÔNG ANH</h2>
        <h1 style = "text-align: center">BÁO CÁO CÔNG NỢ HOA HỒNG PHẢI TRẢ</h1>
        <div style=" display: flex; justify-content: center;">
            <p style="margin: 0 40px">Từ ngày: ${startAt}</p>
            <p style="margin: 0 40px">Đến ngày: ${endAt}</p>
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
                <th rowspan = "2">Ghi chú</th>
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
            </tr>
            ${data.map((item) => {
                return `<tr>
                    <td>${item.id}</td> 
                        <td>${item.code}</td> 
                        <td>${item.partner}</td>
                        <td>${item.type}</td>
                        <td>${item.payStart}</td>
                        <td>${item.payUp}</td>
                        <td>${item.payDown}</td>
                        <td>${item.payEnd}</td>
                        <td>${item.note}</td>
                        <td>${item.payRequest}</td>
                        <td>${item.payApproval}</td>
                </tr>`;
            })}
        </table>
    </body>
</html>
`;
};
