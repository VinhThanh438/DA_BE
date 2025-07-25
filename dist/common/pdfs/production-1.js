"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.production1PDF = void 0;
const app_constant_1 = require("../../config/app.constant");
const production1PDF = (data) => {
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
      padding: 5px;
      text-align: center;
      font-size: 12px;
    }
  </style>

  <body style="padding: 0 20px">
    <div id="order">
      <div
        style="display: flex; gap: 20px; align-items: center; padding: 0 20px"
      >
        <div style="display: flex; flex-direction: column; align-items: center">
          <img style="height: 100px" src="${app_constant_1.logoLeft}" />
        </div>
        <div style="display: flex; align-items: left; flex-direction: column">
          <p style="font-weight: 600; font-size: 15px">
            ${data.company || ''}
          </p>
          <p style="font-size: 12px; font-weight: 600">
            ĐT: 024 3968 6769 - Fax: 024 3968 2486
          </p>
          <div style="display: flex; align-items: center; width: 100%">
            <p style="flex: 4; font-size: 13px">Lệnh sản xuất số</p>
            <p style="flex: 1; font-size: 13px">:</p>
            <p style="flex: 2; font-size: 13px; color: red">12345</p>
          </div>
        </div>
        <div style="width: 45%">
          <p style="text-align: center; font-size: 22px">LỆNH SẢN XUẤT</p>
          <p style="text-align: center; font-size: 10px; color: red">
            Lưới thép hàn
          </p>
          <div style="display: flex; text-align: right; width: 100%">
            <p style="flex: 3; font-size: 13px">Mã khách hàng</p>
            <p style="flex: 1; font-size: 13px">:</p>
            <p style="flex: 2; font-size: 13px; font-weight: 700">TK-VN</p>
            <i style="flex: 5; font-size: 13px"> ngày... tháng ... năm 20.. </i>
          </div>
        </div>
      </div>

      <table style="width: 100%; padding: 0 20px">
        <tr>
          <th style="font-size: 10px" colspan="1">STT</th>
          <th rowspan="2" style="font-size: 10px">Khu vực</th>
          <th rowspan="2" style="font-size: 10px">Tên lưới</th>
          <th style="font-size: 10px" colspan="1">SL</th>
          <th style="font-size: 10px; background-color: yellow" colspan="1">
            Chiều dài
          </th>
          <th style="font-size: 10px" colspan="1">Φ</th>
          <th style="font-size: 10px" colspan="1">Khoảng cách</th>
          <th style="font-size: 10px" colspan="1">Chìa</th>
          <th style="font-size: 10px" colspan="2">Số Thanh</th>
          <th style="font-size: 10px; background-color: yellow" colspan="1">
            Chiều rộng lưới
          </th>
          <th style="font-size: 10px" colspan="1">Φ</th>
          <th style="font-size: 10px" colspan="1">Khoảng cách</th>
          <th style="font-size: 10px" colspan="1">Chìa</th>
          <th style="font-size: 10px" colspan="2">Số Thanh</th>
          <th
            style="font-size: 10px; background-color: rgb(245, 199, 167)"
            colspan="2"
          >
            Khối lượng
          </th>
          <th
            style="font-size: 10px; background-color: rgb(245, 199, 167)"
            colspan="2"
          >
            Diện tích (m²)
          </th>
        </tr>
        <tr>
          <th style="font-size: 10px">Mh</th>
          <th style="font-size: 10px">Tấm</th>
          <th style="font-size: 10px; background-color: yellow">mm</th>
          <th style="font-size: 10px">mm</th>
          <th style="font-size: 10px">mm</th>
          <th style="font-size: 10px">mm</th>
          <th style="font-size: 10px">1tấm</th>
          <th style="font-size: 10px">Tổng</th>
          <th style="font-size: 10px; background-color: yellow">mm</th>
          <th style="font-size: 10px">mm</th>
          <th style="font-size: 10px">mm</th>
          <th style="font-size: 10px">mm</th>
          <th style="font-size: 10px">1tấm</th>
          <th style="font-size: 10px">Tổng</th>
          <th style="font-size: 10px; background-color: rgb(245, 199, 167)">
            1tấm
          </th>
          <th style="font-size: 10px; background-color: rgb(245, 199, 167)">
            Tổng
          </th>
          <th style="font-size: 10px; background-color: rgb(245, 199, 167)">
            1tấm
          </th>
          <th style="font-size: 10px; background-color: rgb(245, 199, 167)">
            Tổng
          </th>
        </tr>

        <tr>
          <td>1</td>
          <td rowspan="" style="background-color: white">Zone 1 lớp dưới</td>
          <td>Lưới A1</td>
          <td>10</td>
          <td style="background-color: yellow">2000</td>
          <td>10</td>
          <td>150</td>
          <td>50</td>
          <td style="color: red">12</td>
          <td style="color: red">120</td>
          <td style="background-color: yellow">2000</td>
          <td>8</td>
          <td>200</td>
          <td>40</td>
          <td style="color: red">10</td>
          <td style="color: red">100</td>
          <td style="background-color: rgb(245, 199, 167); color: red">
            120.5
          </td>
          <td style="background-color: rgb(245, 199, 167); color: red">1205</td>
          <td style="background-color: rgb(245, 199, 167); color: red">1.5</td>
          <td style="background-color: rgb(245, 199, 167); color: red">15</td>
        </tr>

        <tr>
          <th colspan="3">Dung sai</th>
          <th colspan="17"></th>
        </tr>
        <tr>
          <th rowspan="2" colspan="3">Nguồn phối</th>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
          <th colspan="3" rowspan="2">Tổng</th>
          <th colspan="2" rowspan="2" style="color: red">12,872</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="2">D12-HP</th>
          <th colspan="1" style="color: red">5000</th>
          <th colspan="2">D12-VM</th>
          <th colspan="1" style="color: red">3000</th>
          <th colspan="2">D12-NS</th>
          <th colspan="1" style="color: red">2000</th>
          <th colspan="2">D12-kyoie</th>
          <th colspan="1" style="color: red">2495</th>
        </tr>
        <tr>
          <th colspan="3">Tiến độ</th>
          <th rowspan="1" colspan="17"></th>
        </tr>
        <tr>
          <th rowspan="2" colspan="3">Ghi chú</th>
          <th colspan="17">Hp - hòa phát, VĐ- Việt nhật</th>
        </tr>
        <tr>
          <th colspan="17">Ghi chú</th>
        </tr>
      </table>
    </div>
  </body>
</html>`;
};
exports.production1PDF = production1PDF;
