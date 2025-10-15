# Comic Reader Dashboard - Complete Setup Guide

## Tổng quan

Dashboard system hoàn chình với multiple pages và permission-based access control:

### 📊 **Main Dashboard** (`/dashboard`)
- Tổng quan thống kê
- Quick actions với permission checking
- User switching cho testing
- Backend connection status

### 📚 **Manga Management** (`/dashboard/manga`) 
- CRUD operations cho manga
- Search và filtering
- Permission-based UI (create/read/update/delete)
- Modal forms cho create/edit

### 👥 **User Management** (`/dashboard/users`) - Admin Only
- Quản lý users và roles
- Create/Edit/Delete users
- Status management (active/inactive/suspended)
- Role assignment

### ⚙️ **System Settings** (`/dashboard/settings`) - Admin Only  
- Site configuration
- File upload settings
- Notification preferences
- Backend connection testing

### 🛡️ **Content Moderation** (`/dashboard/moderation`) - Moderator/Admin
- Review reported content
- Approve pending submissions
- Content quality control
- Priority-based workflow

## User Roles & Page Access

### 🔴 **Admin** (username: `admin`)
- ✅ All pages accessible
- ✅ Full CRUD permissions
- ✅ User management
- ✅ System settings
- ✅ Content moderation

### 🟡 **Moderator** (username: `moderator`)  
- ✅ Main dashboard
- ✅ Manga management (read/update only)
- ❌ User management (access denied)
- ❌ System settings (access denied)
- ✅ Content moderation

### 🟢 **Editor** (username: `editor`)
- ✅ Main dashboard
- ✅ Manga management (create/read/update)
- ❌ User management (access denied)
- ❌ System settings (access denied)
- ❌ Content moderation (access denied)

### 🔵 **User** (username: `reader`)
- ❌ Dashboard access (access denied)
- ❌ All management pages (access denied)

## Page Navigation Structure

```
/dashboard
├── /manga              # Manga management
├── /users              # User management (admin only)
├── /settings           # System settings (admin only)
└── /moderation         # Content review (moderator/admin)
```

## Quick Actions từ Main Dashboard

### Manga Management Section:
- **"Add New Manga"** → `/dashboard/manga` (với create form modal)
- **"Manage Existing Manga"** → `/dashboard/manga` (listing view)
- **"Review Pending Manga"** → `/dashboard/moderation` (pending tab)

### User Management Section (Admin only):
- **"Manage Users"** → `/dashboard/users`
- **"Role & Permissions"** → Coming soon
- **"System Settings"** → `/dashboard/settings`

### Moderation Tools Section (Moderator only):
- **"Review Reported Content"** → `/dashboard/moderation` (reports tab)
- **"Content Approval"** → `/dashboard/moderation` (pending tab)

## Backend API Configuration

### Required Endpoints

Backend Tomcat cần implement các endpoints sau:

```
Base URL: http://localhost:8080

# Health Check
GET /api/health

# Authentication
POST /api/auth/login
GET /api/auth/me
POST /api/auth/logout

# Dashboard
GET /api/dashboard/stats
GET /api/dashboard/activity

# Manga Management
GET /api/manga
GET /api/manga/{id}
POST /api/manga
PUT /api/manga/{id}
DELETE /api/manga/{id}

# User Management (Admin only)
GET /api/users
GET /api/users/{id}
POST /api/users
PUT /api/users/{id}
DELETE /api/users/{id}
```

### Example Response Formats

#### Dashboard Stats
```json
{
  "totalUsers": 1247,
  "activeUsers": 892,
  "totalManga": 345,
  "publishedManga": 298,
  "totalChapters": 4532,
  "totalViews": 125847,
  "newUsersThisMonth": 89,
  "newMangaThisMonth": 23
}
```

#### Recent Activity
```json
[
  {
    "id": "1",
    "type": "success",
    "message": "New manga published",
    "timestamp": "2 hours ago"
  }
]
```

#### Login Response
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "username": "admin",
    "email": "admin@example.com",
    "role": {
      "id": "role-id",
      "name": "admin",
      "permissions": [...],
      "description": "System Administrator"
    },
    "status": "active",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2025-10-08T08:00:00Z",
    "lastLogin": "2025-10-09T09:15:00Z"
  }
}
```

## CORS Configuration

Để frontend có thể gọi API, cần cấu hình CORS trong backend:

### Java Servlet Filter
```java
@WebFilter("/*")
public class CorsFilter implements Filter {
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) {
        HttpServletResponse response = (HttpServletResponse) res;
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        response.setHeader("Access-Control-Allow-Credentials", "true");
        chain.doFilter(req, res);
    }
}
```

### Or web.xml Configuration
```xml
<filter>
    <filter-name>CorsFilter</filter-name>
    <filter-class>org.apache.catalina.filters.CorsFilter</filter-class>
    <init-param>
        <param-name>cors.allowed.origins</param-name>
        <param-value>http://localhost:3000</param-value>
    </init-param>
    <init-param>
        <param-name>cors.allowed.methods</param-name>
        <param-value>GET,POST,HEAD,OPTIONS,PUT,DELETE</param-value>
    </init-param>
</filter>
<filter-mapping>
    <filter-name>CorsFilter</filter-name>
    <url-pattern>/*</url-pattern>
</filter-mapping>
```

## How to Test

1. **Start Frontend**:
   ```bash
   npm run dev
   ```

2. **Start Backend**: 
   - Ensure Tomcat is running on port 8080
   - Deploy your Java application with the required endpoints

3. **Test Dashboard**:
   - Navigate to `/dashboard`
   - Select different users from dropdown to test permissions
   - Check backend connection status indicator
   - Use "Test Backend Connection" button (admin only)

## Permission-based UI Features

### UI Elements that are Hidden/Shown based on Permissions:

1. **Manga Management Section**:
   - "Add New Manga" button: `hasPermission(user, 'manga', 'create')`
   - "Manage Existing Manga": `hasPermission(user, 'manga', 'read')`
   - "Review Pending Manga": `hasPermission(user, 'manga', 'update')`

2. **User Management Section** (Admin Only):
   - Entire section: `isAdmin(user)`
   - "Manage Users", "Role & Permissions", "System Settings"

3. **Moderation Tools** (Moderator Only):
   - Entire section: `isModerator(user) && !isAdmin(user)`
   - "Review Reported Content", "Content Approval"

4. **Dashboard Access**:
   - Entire dashboard: `hasPermission(user, 'dashboard', 'read')`
   - Users without dashboard permission see "Access Denied"

## Mock Data vs Real Backend

- Dashboard automatically detects if backend is available
- If backend is unreachable, falls back to mock data
- Connection status is shown in header with colored indicator:
  - 🟢 Green: Backend Connected
  - 🔴 Red: Using Mock Data

## File Structure

```
src/
├── components/
│   └── BackendSetupGuide.tsx    # Setup guide component
├── contexts/
│   └── AuthContext.tsx          # Authentication management
├── data/
│   └── mockUsers.ts             # Mock user data with different roles
├── services/
│   └── api.ts                   # API service for backend calls
├── types/
│   ├── auth.ts                  # Authentication types
│   └── dashboard.ts             # Dashboard types
├── utils/
│   └── backendTester.ts         # Backend testing utilities
└── app/
    └── dashboard/
        └── page.tsx             # Main dashboard component
```

## Development Notes

- User switching is enabled for testing different permission levels
- All API calls include proper error handling and fallbacks
- Backend connection is tested on component mount
- Permission checks are performed at component level to hide/show UI elements
- Mock data provides realistic testing environment when backend is unavailable