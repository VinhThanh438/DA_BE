import { formatNumberWithDots } from '@common/helpers/format-number-with-dots';
import { TimeHelper } from '@common/helpers/time.helper';
import { TransactionType } from '@config/app.constant';

export const bankPDF = (data: any, sum: any) => {
    const transactions: any[] = data.transactions || [];
    let sumIncome = 0;
    let sumExpense = 0;
    let sumDebt = 0;
    let currentDebt = 0;
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
            table th:last-child,
        table td:last-child {
            border-right: 1px solid black !important;
        }
    </style>
    <body>
        <h2>${transactions[0]?.organization?.name || ''}</h2>
        <div style="display: flex; width: 100vw; align-items: center">
            <div style="flex: 1">Nhật ký giao dịch Ngân hàng ${transactions[0]?.bank?.bank || ''}</div>
            <h1 style="flex: 1; text-align: center">${transactions[0]?.bank?.bank || ''}</h1>
        </div>
        <div>Đơn vị: VNĐ</div>
        </br>
        <table>
            <tr>
                <th rowspan="2">STT</th>
                <th rowspan="2">Ngày</th>
                <th rowspan="2">Nội dung</th>
                <th rowspan="2">Mã khách hàng</th>
                <th colspan="2">Số dư đầu kỳ</th>
                <th>${data?.beginning ? formatNumberWithDots(data?.beginning) : ''}</th>
                <th colspan="2">Số</th>
            </tr>
            <tr>
                <th>Phát sinh có</th>
                <th>Phát sinh nợ</th>
                <th>Số dư</th>
                <th>Đơn hàng</th>
                <th>Hóa đơn</th>
            </tr>
                ${transactions.map((item, index) => {
                    let parseAmount = parseInt(item?.amount || 0);
                    if (item?.type === TransactionType.IN) {
                        sumIncome += parseAmount;
                        currentDebt = (currentDebt === 0 ? data?.beginning || 0 : currentDebt) + parseAmount;
                    } else if (item?.type === TransactionType.OUT) {
                        sumExpense += parseAmount;
                        currentDebt = (currentDebt === 0 ? data?.beginning || 0 : currentDebt) - parseAmount;
                    }
                    // sumDebt += currentDebt;
                    return `<tr>
                    <td>${index + 1}</td>
                    <td>${item?.time_at ? TimeHelper.format(item.time_at, 'DD/MM/YYYY') : ''}</td>
                    <td style="text-align: left">${item?.note || ''}</td>
                    <td>${item?.partner?.code || ''}</td>
                    <td>${item?.type === TransactionType.IN && parseAmount > 0 ? formatNumberWithDots(parseAmount) : ''}</td>
                    <td>${item?.type === TransactionType.OUT && parseAmount > 0 ? formatNumberWithDots(parseAmount) : ''}</td>
                    <td>${formatNumberWithDots(currentDebt)}</td>
                    <td>${item?.order?.code || ''}</td>
                    <td>${item?.invoice?.code || ''}</td>
                    </tr>`;
                }).join('')}
            <tr>
                <td colspan="4">Tổng</td>
                <td>${formatNumberWithDots(sumIncome)}</td>
                <td>${formatNumberWithDots(sumExpense)}</td>
                <td>${formatNumberWithDots(currentDebt)}</td>
                <td></td>
                <td></td>
            </tr>
            <tr>
                <td colspan="7" style="text-align: left">Số dư bằng chữ:</td>
                <td></td>
                <td></td>
            </tr>
        </table>
    </body>
</html>
`;
};
