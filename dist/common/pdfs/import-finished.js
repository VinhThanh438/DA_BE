"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importFinishedPDF = void 0;
const app_constant_1 = require("../../config/app.constant");
const importFinishedPDF = (data) => {
    const rowsHtml = (data.details || [])
        .map((item, idx) => {
        var _a, _b, _c, _d, _e, _f;
        return `
        <tr>
            <td style="font-size: 14px">${idx + 1}</td>
            <td style="font-size: 14px">${((_a = item === null || item === void 0 ? void 0 : item.product) === null || _a === void 0 ? void 0 : _a.name) || ''}</td>
            <td style="font-size: 14px">${((_b = item === null || item === void 0 ? void 0 : item.product) === null || _b === void 0 ? void 0 : _b.code) || ''}</td>
            <td style="font-size: 14px">${(item === null || item === void 0 ? void 0 : item.specification) || ''}</td>
            <td style="font-size: 14px">${(item === null || item === void 0 ? void 0 : item.unit) || ''}</td>
            <td style="font-size: 14px">${(_c = item === null || item === void 0 ? void 0 : item.production_quantity) !== null && _c !== void 0 ? _c : ''}</td>
            <td style="font-size: 14px">${(_d = item === null || item === void 0 ? void 0 : item.export1_quantity) !== null && _d !== void 0 ? _d : ''}</td>
            <td style="font-size: 14px">${(_e = item === null || item === void 0 ? void 0 : item.export2_quantity) !== null && _e !== void 0 ? _e : ''}</td>
            <td style="font-size: 14px">${(_f = item === null || item === void 0 ? void 0 : item.export3_quantity) !== null && _f !== void 0 ? _f : ''}</td>
        </tr>
    `;
    })
        .join('');
    return `<html lang="en">
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
        padding: 10px;
        text-align: center;
        }
    </style>

    <body style="padding: 0 20px">
        <div id="order">
        <div
            style="display: flex; gap: 20px; align-items: center; padding: 0 20px"
        >
            <div style="display: flex; flex-direction: column; align-items: center">
            <img style="height: 100px" src="${app_constant_1.logoLeft}" />
            <p style="font-weight: 600; font-size: 12px">ISO 9001:2015</p>
            </div>
            <div style="display: flex; align-items: left; flex-direction: column">
            <p style="font-weight: 600; font-size: 15px">
                ${data.organization.name || ''}
            </p>
            <p style="font-size: 12px">Địa chỉ: ${data.organization.address || ''}</p>
            <p style="font-size: 12px">${data.organization.phone || ''}</p>
            <p style="font-size: 12px">MST: ${data.organization.tax_code || ''}</p>
            <p style="font-size: 12px">
                Tài khoản: 2141.0000.378769 – NH Đầu tư và PT Đông Hà Nội
            </p>
            </div>
            <div style="width: 70px"></div>
        </div>
        <hr style="margin-bottom: 1px" />
        <hr />

        <div style="padding: 0 20px">
            <div
            style="
                display: flex;
                align-items: center;
                justify-content: space-between;
            "
            >
            <div style="display: flex">
                <i style="font-size: 14px">ngày... tháng... năm 2025</i>
            </div>
            <div
                style="
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 13px;
                margin-top: 4px;
                "
            >
                <b>Số:</b>
                <i style="color: red">12345 - Lần 1</i>
            </div>
            </div>
            <div>
            <p style="text-align: center; font-size: 28px">
                PHIẾU NHẬP THÀNH PHẨM
            </p>
            </div>

            <div style="display: flex; align-items: center; width: 100%">
            <p style="flex: 4; font-size: 13px">Bộ phận nhận hàng</p>
            <p style="flex: 1; font-size: 13px">:</p>
            <p style="flex: 5; font-size: 13px; font-weight: 700">
                Tổ gia công thép người
            </p>
            <p style="flex: 10; font-size: 13px">Lệnh SX số:</p>
            <p style="flex: 1; font-size: 13px">123</p>
            </div>
            <div style="display: flex; align-items: center; width: 100%">
            <p style="font-size: 12px; flex: 4">Đại diện nhận hàng</p>
            <p style="flex: 1">:</p>
            <p style="flex: 5; font-size: 12px; font-weight: 700">Trần Văn Anh</p>
            <p style="flex: 10; font-size: 12px">Mã số nhân viên:</p>
            <p style="flex: 1; font-size: 12px; color: red">222</p>
            </div>
            <div style="display: flex; align-items: center; width: 100%">
            <p style="font-size: 12px; flex: 4">Xuất tại kho</p>
            <p style="flex: 1; font-size: 13px">:</p>
            <p style="flex: 5; font-size: 13px; font-weight: 700">........</p>
            <p style="font-size: 12px; flex: 10">Thủ kho: Ngọc</p>
            <p style="flex: 1; font-size: 12px"></p>
            </div>
        </div>

        <table>
            <tr>
            <th rowspan="2" style="font-size: 14px">STT</th>
            <th rowspan="2" style="font-size: 14px">Tên vật tưu</th>
            <th rowspan="2" style="font-size: 14px">Mã vật tư</th>
            <th rowspan="2" style="font-size: 14px">Quy cách</th>
            <th rowspan="2" style="font-size: 14px">ĐVT</th>
            <th style="font-size: 14px" colspan="4">Số lượng</th>
            </tr>
            <tr>
            <th style="font-size: 14px">Theo lệnh sản xuất</th>
            <th style="font-size: 14px">Thực xuất lần 1</th>
            <th style="font-size: 14px">Thực xuất lần 2</th>
            <th style="font-size: 14px">Thực xuất lần 3</th>
            </tr>

            <tr>
            <td style="font-size: 14px">1</td>
            <td style="font-size: 14px">Thép cuộn D6</td>
            <td style="font-size: 14px">6-HP</td>
            <td style="font-size: 14px">2000kg/cuộn</td>
            <td style="font-size: 14px">Kg</td>
            <td style="font-size: 14px">30.000</td>
            <td style="font-size: 14px">20.000</td>
            <td style="font-size: 14px">10.000</td>
            <td style="font-size: 14px"></td>
            </tr>
            <tr>
            <td style="font-size: 14px">2</td>
            <td style="font-size: 14px">Thép cây D10</td>
            <td style="font-size: 14px">10-TC</td>
            <td style="font-size: 14px">12m/thanh</td>
            <td style="font-size: 14px">Cây</td>
            <td style="font-size: 14px">500</td>
            <td style="font-size: 14px">300</td>
            <td style="font-size: 14px">100</td>
            <td style="font-size: 14px">100</td>
            </tr>
            <tr>
            <td style="font-size: 14px">3</td>
            <td style="font-size: 14px">Lưới thép hàn</td>
            <td style="font-size: 14px">LT-H8</td>
            <td style="font-size: 14px">2m x 5m, Ø8</td>
            <td style="font-size: 14px">Tấm</td>
            <td style="font-size: 14px">200</td>
            <td style="font-size: 14px">150</td>
            <td style="font-size: 14px">30</td>
            <td style="font-size: 14px">20</td>
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
            <p><b>Người nhận hàng</b></p>
            <p>(Ký, ghi rõ họ tên)</p>
            </div>
            <div style="flex: 1">
            <p><b>Phụ trách bộ phận</b></p>
            <p>(Ký, ghi rõ họ tên)</p>
            </div>
            <div style="flex: 1">
            <p><b>Thủ kho</b></p>
            <p>(Ký, ghi rõ họ tên)</p>
            </div>
            <div style="flex: 1">
            <p><b>Kế toán trưởng</b></p>
            <p>(Ký, ghi rõ họ tên)</p>
            </div>
            <div style="flex: 1">
            <p><b>Giám đốc</b></p>
            <p>(Ký, ghi rõ họ tên)</p>
            </div>
        </div>
        </div>
    </body>
    </html>`;
};
exports.importFinishedPDF = importFinishedPDF;
