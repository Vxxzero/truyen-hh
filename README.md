# TRUYỆN H - Full-stack starter

## Công nghệ
- Frontend: HTML, CSS, JavaScript thuần, giao diện ưu tiên điện thoại.
- Backend: Node.js + Express REST API.
- Database: MongoDB + Mongoose.
- Tài khoản: bcrypt hash mật khẩu, JWT token.
- Chức năng: đăng ký/đăng nhập, danh sách/tìm truyện, chương, bình luận, lịch sử đọc (đồng bộ khi đăng nhập), lưu truyện trên trình duyệt.

## Cần cài
- Node.js 18 trở lên
- MongoDB local hoặc MongoDB Atlas
- Acode có thể dùng để sửa file; để chạy server cần môi trường chạy Node.js (máy tính, VPS hoặc dịch vụ hosting Node).

## Chạy trên máy tính
1. Giải nén ZIP.
2. Mở terminal tại thư mục dự án.
3. Chạy `npm install`.
4. Sao chép `.env.example` thành `.env`, điền `MONGODB_URI` và `JWT_SECRET`.
5. Chạy `npm run dev` hoặc `npm start`.
6. Mở `http://localhost:3000`.

## API chính
- `POST /api/auth/register` — đăng ký `{username,email,password}`
- `POST /api/auth/login` — đăng nhập `{email,password}`
- `GET /api/auth/me` — tài khoản hiện tại (Bearer token)
- `GET /api/stories?q=&genre=&protagonist=&sort=` — danh sách/tìm truyện
- `GET /api/stories/:id` — thông tin truyện và danh sách chương
- `GET /api/stories/:id/chapters/:number` — nội dung chương
- `GET /api/comments/story/:storyId` — bình luận
- `POST /api/comments` — thêm bình luận (đăng nhập)
- `GET /api/history` — lịch sử trên server (đăng nhập)
- `POST /api/history` — cập nhật lịch sử (đăng nhập)

## API quản trị nội dung
Các API này yêu cầu JWT của tài khoản có `role: "admin"`:
- `POST /api/stories` — tạo truyện
- `POST /api/stories/:id/chapters` — thêm chương

### Tạo tài khoản admin đầu tiên
Đăng ký tài khoản bình thường. Sau đó, trong MongoDB Compass hoặc mongosh, tìm user theo email và đổi `role` thành `admin`.
Ví dụ mongosh:
`db.users.updateOne({email:"admin@example.com"}, {$set:{role:"admin"}})`

Không đưa mật khẩu hoặc JWT secret lên GitHub. Đổi JWT_SECRET dài, ngẫu nhiên trước khi triển khai công khai.

## Lưu ý
Đây là bộ khung có thể chạy và phát triển tiếp, chưa bao gồm trang quản trị trực quan, upload ảnh, quên mật khẩu/email xác thực, phân trang UI, chống spam nâng cao hoặc quy trình kiểm duyệt nội dung. Tài khoản demo không tự tạo dữ liệu truyện; cần thêm truyện/chương bằng API quản trị.
