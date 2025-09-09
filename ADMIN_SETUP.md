# Admin Dashboard Setup Guide

## Hướng dẫn thiết lập và chạy Admin Dashboard

### 1. Backend (Spring Boot)

#### Cài đặt và chạy:
```bash
cd Comic
./mvnw spring-boot:run
```

Backend sẽ chạy trên: `http://localhost:8080`

#### API Endpoints:

**Manga Management:**
- GET `/api/manga` - Lấy tất cả manga
- POST `/api/manga` - Thêm manga mới
- PUT `/api/manga/{id}` - Cập nhật manga
- DELETE `/api/manga/{id}` - Xóa manga

**User Management:**
- GET `/api/users` - Lấy tất cả users
- POST `/api/users` - Thêm user mới
- PUT `/api/users/{id}` - Cập nhật user
- DELETE `/api/users/{id}` - Xóa user
- GET `/api/users/role/{role}` - Lấy users theo role

**Admin Dashboard:**
- GET `/api/admin/stats` - Thống kê tổng quan
- GET `/api/admin/dashboard` - Dữ liệu dashboard

### 2. Frontend (Next.js)

#### Cài đặt dependencies:
```bash
cd ComicReaderSite
npm install
```

#### Chạy development server:
```bash
npm run dev
```

Frontend sẽ chạy trên: `http://localhost:3000`

### 3. Database Setup

#### Thêm dữ liệu mẫu:
1. Mở MongoDB Compass hoặc MongoDB Shell
2. Kết nối tới database của bạn
3. Chạy script trong file `sampleUsersData.mongodb.js` để thêm users mẫu

### 4. Admin Dashboard Features

#### Dashboard Chính (`/admin`):
- Thống kê tổng quan (Manga, Users, Authors, Admins)
- Danh sách users và manga gần đây
- Navigation nhanh đến các trang quản lý

#### Quản lý Manga (`/admin/manga`):
- Xem danh sách tất cả manga
- Thêm manga mới
- Chỉnh sửa manga 
- Xóa manga
- Upload cover image (URL)

#### Quản lý Users (`/admin/users`):
- Xem danh sách tất cả users
- Thêm user mới
- Chỉnh sửa thông tin user
- Thay đổi role (user, author, admin)
- Kích hoạt/vô hiệu hóa user
- Xóa user

### 5. Access URLs

- **Main Site**: `http://localhost:3000`
- **Admin Dashboard**: `http://localhost:3000/admin`
- **Manga Management**: `http://localhost:3000/admin/manga`
- **User Management**: `http://localhost:3000/admin/users`

### 6. Sample Data

#### Sample Users:
- **admin@mangareader.com** (admin) 
- **author1@mangareader.com** (author)
- **author2@mangareader.com** (author)
- **user1@mangareader.com** (user)
- **user2@mangareader.com** (user)

### 7. Technologies Used

**Backend:**
- Spring Boot
- MongoDB
- Spring Data MongoDB
- REST API

**Frontend:**
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Responsive Design

### 8. Features Implemented

✅ **Dashboard**
- Thống kê tổng quan
- Recent users/manga
- Navigation

✅ **Manga Management**
- CRUD operations
- Form validation
- Image preview

✅ **User Management** 
- CRUD operations
- Role management
- Status management
- Table view

✅ **Responsive Design**
- Mobile-friendly
- Clean UI/UX
- Consistent styling

### 9. Next Steps (Tính năng mở rộng)

- Authentication & Authorization
- File upload cho manga covers
- Advanced statistics với charts
- Search và filtering
- Pagination cho large datasets
- Email notifications
- User profiles
- Manga categories/tags
- Reading progress tracking
