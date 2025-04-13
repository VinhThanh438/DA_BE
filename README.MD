# BE_DA

## Project Architecture

Dự án này cung cấp một **hệ thống backend** sử dụng **ExpressJS** và **Prisma ORM**. Nó được thiết kế để **tách biệt xử lý logic** giữa các thành phần khác nhau trong hệ thống (**API, worker, socket, message queue, v.v.**) nhằm đảm bảo **tính module và dễ bảo trì**.

---

### 🏗 Architectural Separation

- **API**: Xử lý logic API và trả về phản hồi cho người dùng.
- **Worker**: Xử lý các tác vụ nền và tính toán nặng.
- **Thành phần khác**: Các thành phần bổ sung như socket, message queue, v.v., được quản lý riêng biệt.
- **Common**: Xử lý các tác vụ chung của các thành phần khác (bussiness logic, adapter,... và những tài nguyên dùng để phục vụ chính trong `common`).
- **Config**: Chứa các thành phần khai báo const của các đối tượng và data fix cứng trong hệ thống.
- **Event và Job** Sẽ được khai báo và đăng ký và khai báo thông qua các thành phần liên quan.
---

### ⚙️ Business Logic Handling

Toàn bộ logic nghiệp vụ được xử lý trong thư mục `common` và `services` bên trong `common`, **tránh phụ thuộc chéo** giữa các thành phần khác nhau trong hệ thống.

---

### 🛠 Modular Design Approach

Dự án này tuân theo **cách tiếp cận lập trình theo module**, trong đó **entity** được quản lý và xử lý trong một module riêng biệt, đảm bảo **tính mở rộng và dễ bảo trì**.
VD: module của đối tượng `auth` chỉ xử lý liên quan đến API sẽ quy vào cùng một folder auth **(route, controller, validator)**, các logic liên quan đến xử lý chung giữa các thành phần cũng sẽ quy về một folder `auth` trong common **(service, event)**

---

### 💬 Message Language
Các message được trả về sẽ được dịch tự động qua 2 ngôn ngữ là Anh và Việt theo request của user theo config trong i18.middleware và response.middleware. VD: máy client có ngôn ngữ là tiếng Việt thì message từ mỗi response sẽ trả về tiếng Việt và ngược lại.

---

### 🎯 Object-Oriented Configuration with EventEmitter

Để đảm bảo khả năng **tái sử dụng và bảo trì** các **tác vụ phụ (side effects)**, dự án này sử dụng **lập trình hướng sự kiện** với Node.js 
[`EventEmitter`](https://nodejs.org/api/events.html).
[`Link tham khảo`](https://viblo.asia/p/event-driven-programming-va-cau-chuyen-nguoi-dua-thu-1VgZvA8YKAw)
Dễ dàng triển khai triến lược multiple entrypoint khi cần scale hệ thống. Đối với các hệ thống tải lớn có khả năng mở rộng CPU với nhiều core và đa luồng có thể xử lý tách các tác vụ ra thành các entrypoint để quản lý các process ra riêng biệt và tận dụng được khả năng đa luồng của CPU.
[`Link tham khảo`](https://viblo.asia/p/api-nodejs-cua-toi-da-handle-peak-traffic-nhu-the-nao-x7Z4D6mPLnX)

#### 🔹 Why use EventEmitter?
- **Tách biệt logic**: Logic nghiệp vụ và các tác vụ phụ (ghi log, thông báo, cập nhật cache,... ) được xử lý riêng biệt.
- **Tái sử dụng tốt hơn**: Nhiều module có thể lắng nghe cùng một sự kiện mà không cần chỉnh sửa logic cốt lõi.
- **Dễ mở rộng**: Có thể thêm các bộ xử lý sự kiện mới mà không cần thay đổi mã nguồn hiện có.
- **Cải thiện tốc độ phản hồi sau mỗi request**: Các side effect được tách biệt và xử lý bất đồng bộ sẽ làm giảm thời gian phản hồi của app

---

## COMMAND

### Application
- `yarn dev` Chạy dự án với môi trường dev
- `yarn build` Build project vào thư mục dist. Thường sẽ chạy build trước khi đẩy lên main để đảm bảo build trên github action không xảy ra lỗi
- `yarn format` Format toàn bộ source trong dự án
- `yarn clean` Tương tự như câu lệnh `rm -rf` trên Unix/Linux dùng để clean dữ liệu trong thư mục dist
- `yarn start` Chạy ứng dụng trong thư mục dist (production)

### Prisma
- `yarn prisma:push` Để đồng bộ schema với database hiện tại sau khi thay đổi về db
- `yarn prisma:gen` Generate schema
- `yarn prisma:mig` Tạo vào áp dụng migration
- `yarn prisma:seed` Để khởi tạo dữ liệu mẫu từ file seed.ts
- `yarn prisma:reset` Để xóa toàn bộ dữ liệu trong database

---

## APP
### Luồng thiết bị đăng nhập
- User khi đăng nhập từ client sẽ gửi lên một device_id, hệ thống sẽ kiểm tra device_id đó để xác định thiết bị đăng nhập của user
+ Nếu device_id = null => lỗi client trả về thông báo lỗi
+ Nếu device_id không khớp trong hệ thống (thiết bị mới) -> Hệ thống gửi thông báo chờ về mail cho user (mail trong bảng `employee`)
-> tạo một bản ghi vào `device_request` chờ quản trị viên duyệt. Nếu quản trị viên chấp nhận, đăng xuất tất cả các thiết bị đang truy cập vào tài khoản đó và cập nhật lại device_id cho user sau đó gửi lại một mail cho user để xác nhận. Từ chối cũng sẽ gửi một mail từ chối về
+ Nếu device_id khớp với device_id trong user => pass

### Token
- Sử dụng device_id để làm secret cho token