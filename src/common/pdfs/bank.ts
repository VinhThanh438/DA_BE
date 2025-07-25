import { capitalizeWords, convertMoneyText, formatNumberWithDots } from '@common/helpers/format-number-with-dots';
import { TimeAdapter } from '@common/infrastructure/time.adapter';
import { TransactionOrderType, TransactionType } from '@config/app.constant';

export const bankPDF = (data: any, sum: any) => {
    const transactions: any[] = data.transactions || [];
    let sumIncome = 0;
    let sumExpense = 0;
    let currentDebt = 0;

    const contentMap: any = {
        [TransactionOrderType.ORDER]: 'Thanh toán đơn hàng',
        [TransactionOrderType.COMMISSION]: 'Thanh toán hoa hồng',
        [TransactionOrderType.INTEREST]: 'Thanh toán lãi khoản vay',
        [TransactionOrderType.LOAN]: 'Thanh toán dư nợ khoản vay',
    };

    return `<html lang="en">
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
        body{
               font-family: "Times New Roman";
      
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
        <p >${transactions[0]?.bank?.name || ''}</p>
        <p style="font-size: 14px">STK: ${transactions[0]?.bank?.account_number || ''}</p>
        <div style="display: flex; width: 100vw; align-items: center">
            <div style="flex: 1; font-size: 12px;">Nhật ký giao dịch Ngân hàng ${transactions[0]?.bank?.bank || ''}</div>
            <h1 style="flex: 1;font-size: 18px; text-align: center">${transactions[0]?.bank?.bank || ''}</h1>
        </div>
        <div style=" font-size: 12px;">Đơn vị: VNĐ</div>
        </br>
        <table style="font-size: 12px;">
            <tr>
                <th rowspan="2">STT</th>
                <th rowspan="2">Ngày</th>
                <th rowspan="2">Nội dung</th>
                <th rowspan="2">Mã khách hàng</th>
                <th colspan="2">Số dư đầu kỳ</th>
                <th style="color: red">${data?.beginning ? formatNumberWithDots(data?.beginning) : ''}</th>
                <th style="color: red"   colspan="2">Số</th>
            </tr>
            <tr>
                <th>Phát sinh có</th>
                <th>Phát sinh nợ</th>
                <th>Số dư</th>
                <th>Đơn hàng</th>
                <th>Hóa đơn</th>
            </tr>
                ${transactions
                    .map((item, index) => {
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
                    <td>${item?.time_at ? TimeAdapter.format(item.time_at, 'DD/MM/YYYY') : ''}</td>
                    <td style="text-align: left">${contentMap[item?.order_type]}</td>
                    <td style="color: red">${item?.partner?.code || ''}</td>
                    <td>${item?.type === TransactionType.IN && parseAmount > 0 ? formatNumberWithDots(parseAmount) : ''}</td>
                    <td>${item?.type === TransactionType.OUT && parseAmount > 0 ? formatNumberWithDots(parseAmount) : ''}</td>
                    <td>${formatNumberWithDots(currentDebt)}</td>
                    <td>${item?.order?.code || ''}</td>
                    <td>${item?.invoice?.code || ''}</td>
                    </tr>`;
                    })
                    .join('')}
            <tr>
                <td colspan="4">Tổng</td>
                <td style=" font-weight: 700">
                    ${sumIncome ? formatNumberWithDots(sumIncome) : ''}
                  </td>
                <td style=" font-weight: 700">${sumExpense ? formatNumberWithDots(sumExpense) : ''}</td>
                <td style=" font-weight: 700">${currentDebt ? formatNumberWithDots(currentDebt) : ''}</td>
                <td></td>
                <td></td>
            </tr>
            <tr>
                <td colspan="7" style="text-align: left">Số dư bằng chữ: ${currentDebt ? capitalizeWords(convertMoneyText(currentDebt)) : ''}</td>
                <td></td>
                <td></td>
            </tr>
        </table>
    </body>
</html>`;
};
