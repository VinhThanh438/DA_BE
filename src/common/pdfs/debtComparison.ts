import { formatNumberWithDots } from '@common/helpers/format-number-with-dots';
import { TimeHelper } from '@common/helpers/time.helper';

export const debtComparisonPDF = (data: any, sum: any, header: any) => {
    let sumTotalMoney = 0;
    let sumReduction = 0;
    let sumEnding = 0;
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
            <h3 style="flex: 1; text-align: center">Số: .......</h3>
            <h3 style="flex: 1; text-align: center">Độc lập_Tự do_Hạnh phúc</h3>
        </div>
        <h1 style="text-align: center">${header.title}</h1>
        <p style="font-style: italic; margin-left: 18px">- Căn cứ vào biên bản giao nhận hàng hoá</p>
        <p style="font-style: italic; margin-left: 18px">- Căn cứ vào thoả thuận giữa hai bên</p>
        <p style="font-style: italic">
            Hôm nay ngày.....tháng.....năm..... tại trụ sở Công ty thép Đông Anh, chúng tôi gồm có
        </p>
        <h3>I. Bên mua (Bên A): ${data?.organization?.name || ''}</h3>
        <div style="display: flex; align-items: center">
            <p style="flex: 1">Địa chỉ: ${data?.organization?.address || ''}</p>
            <p style="flex: 1">Điện thoại: ${data?.organization?.phone || ''}</p>
        </div>
        <div style="display: flex; align-items: center">
            <p style="flex: 1">Đại diện: ${data?.employee?.name || ''}</p>
            <p style="flex: 1">Chức vụ: ${data?.job_position?.name || ''}</p>
        </div>
        <div style="display: flex; align-item: center">
            <h3 style="flex: 1">I. Bên bán (Bên B): ${data?.partner?.name || ''}</h3>
            <p style="flex: 1">Mã KH: ${data?.partner?.code || ''}</p>
        </div>
        <div style="display: flex; align-items: center">
            <p style="flex: 1">Địa chỉ: ${data?.partner?.address || ''}</p>
            <p style="flex: 1">Điện thoại: ${data?.partner?.phone || ''}</p>
        </div>
        <div style="display: flex; align-items: center">
            <p style="flex: 1">Đại diện: ${data?.partner?.representative_name || ''}</p>
            <p style="flex: 1">Chức vụ: ${data?.partner?.representative_position || ''}</p>
        </div>
        <p style="margin-left: 18px">Cùng nhau đối chiếu công nợ giữa hai bên với số liệu như sau:</p>
        <p style="margin-left: 18px">1 Công nợ đầu kỳ: ${data?.beginning_debt ? formatNumberWithDots(data.beginning_debt) : ''}</p>
        <p style="margin-left: 18px">2 Công nợ phát sinh trong kỳ:</p>
        <table>
            <tr>
                <th rowspan="2">STT</th>
                <th rowspan="2">Ngày</th>
                <th rowspan="2">Số HĐ VAT</th>
                <th rowspan="2">Nội dung</th>
                <th>Thành tiền</th>
                <th colspan="3">Thanh toán</th>
                <th>Còn nợ</th>
                <th rowspan="2">Số ĐH</th>
            </tr>
            <tr>
                <th>Vnđ</th>
                <th>Số tiền</th>
                <th>Ngày</th>
                <th>Ngân hàng</th>
                <th>Vnđ</th>
            </tr>
            ${(data.details || []).map((item: any, index: number) => {
                sumTotalMoney+= (item?.total_money || 0)
                sumReduction+= (item?.reduction || 0)
                sumEnding+= (item?.ending || 0)
                return `<tr>
                    <td>${index + 1}</td>
                    <td>${item?.invoice?.time_at ? TimeHelper.format(item.invoice.time_at, 'DD/MM/YYYY') : ''}</td>
                    <td>${item.invoice.code}</td>
                    <td>${item?.note || ''}</td>
                    <td>${item?.total_money || ''}</td>
                    <td>${item?.reduction || ''}</td>
                    <td>${item.time_at ? TimeHelper.format(item.time_at, 'DD/MM/YYYY') : ''}</td>
                    <td>${item?.bank?.name || ''}</td>
                    <td>${item?.ending || ''}</td>
                    <td>${item?.order?.code || ''}</td>
                </tr>`;
            }).join('')}
            <tr style="font-weight: 800">
                <td colspan="4">Tổng</td>
                <td>${sumTotalMoney ? formatNumberWithDots(sum.sumTotalMoney) : ''}</td>
                <td>${sumReduction ? formatNumberWithDots(sum.sumReduction) : ''}</td>
                <td></td>
                <td></td>
                <td>${sumEnding ? formatNumberWithDots(sum.sumEnding) : ''}</td>
                <td></td>
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
