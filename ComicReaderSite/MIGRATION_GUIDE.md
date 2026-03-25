# Comic Reader Dashboard - Migration Guide

## Architecture Overview

### Frontend: Next.js with TypeScript
- Dashboard với RBAC (Role-Based Access Control)
- Admin: Full permissions (manga + user management)
- Moderator: Content management only (no user management)
- User: Read-only access

### Backend: Jakarta EE 11 
- Servlets for REST API
- MySQL Database
- JWT Authentication
- RBAC Implementation

### Database: MySQL
- Users, Roles, Permissions tables
- Manga, Chapters, Pages tables
- Activity logs, System notifications

## Jakarta EE 11 Backend Structure

### 1. Project Structure
```
Comic-Backend/
├── src/main/java/
│   └── com/comicreader/
│       ├── config/
│       │   ├── DatabaseConfig.java
│       │   └── CorsFilter.java
│       ├── model/
│       │   ├── User.java
│       │   ├── Role.java
│       │   ├── Permission.java
│       │   ├── Manga.java
│       │   ├── Chapter.java
│       │   └── ActivityLog.java
│       ├── repository/
│       │   ├── BaseRepository.java
│       │   ├── UserRepository.java
│       │   ├── MangaRepository.java
│       │   └── ActivityLogRepository.java
│       ├── service/
│       │   ├── AuthService.java
│       │   ├── UserService.java
│       │   ├── MangaService.java
│       │   └── DashboardService.java
│       ├── servlet/
│       │   ├── AuthServlet.java
│       │   ├── UserServlet.java
│       │   ├── MangaServlet.java
│       │   └── DashboardServlet.java
│       └── security/
│           ├── JWTUtil.java
│           ├── RBACFilter.java
│           └── PasswordUtil.java
├── src/main/webapp/
│   └── WEB-INF/
│       └── web.xml
└── pom.xml
```

### 2. Maven Dependencies (pom.xml)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <groupId>com.comicreader</groupId>
    <artifactId>comic-backend</artifactId>
    <version>1.0.0</version>
    <packaging>war</packaging>
    
    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <jakarta.version>11.0.0</jakarta.version>
    </properties>
    
    <dependencies>
        <!-- Jakarta EE 11 -->
        <dependency>
            <groupId>jakarta.platform</groupId>
            <artifactId>jakarta.jakartaee-api</artifactId>
            <version>${jakarta.version}</version>
            <scope>provided</scope>
        </dependency>
        
        <!-- MySQL Connector -->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.33</version>
        </dependency>
        
        <!-- Connection Pool -->
        <dependency>
            <groupId>com.zaxxer</groupId>
            <artifactId>HikariCP</artifactId>
            <version>5.0.1</version>
        </dependency>
        
        <!-- JSON Processing -->
        <dependency>
            <groupId>org.glassfish</groupId>
            <artifactId>jakarta.json</artifactId>
            <version>2.0.1</version>
        </dependency>
        
        <!-- JWT -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.11.5</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.11.5</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.11.5</version>
        </dependency>
        
        <!-- Password Hashing -->
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-crypto</artifactId>
            <version>6.1.4</version>
        </dependency>
        
        <!-- Logging -->
        <dependency>
            <groupId>ch.qos.logback</groupId>
            <artifactId>logback-classic</artifactId>
            <version>1.4.11</version>
        </dependency>
    </dependencies>
</project>
```

### 3. Database Schema (MySQL)

```sql
-- Create database
CREATE DATABASE comic_reader CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE comic_reader;

-- Users table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_status (status)
);

-- Roles table
CREATE TABLE roles (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name ENUM('admin', 'moderator', 'user') UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Permissions table
CREATE TABLE permissions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    resource ENUM('manga', 'user', 'role', 'dashboard') NOT NULL,
    action ENUM('create', 'read', 'update', 'delete', 'manage') NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_permission (resource, action)
);

-- Role permissions junction table
CREATE TABLE role_permissions (
    role_id VARCHAR(36),
    permission_id VARCHAR(36),
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- User roles table
CREATE TABLE user_roles (
    user_id VARCHAR(36),
    role_id VARCHAR(36),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by VARCHAR(36),
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Genres table
CREATE TABLE genres (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Manga table
CREATE TABLE manga (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    author VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    status ENUM('ongoing', 'completed', 'hiatus', 'cancelled') DEFAULT 'ongoing',
    cover_image VARCHAR(500),
    is_published BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(36) NOT NULL,
    updated_by VARCHAR(36),
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_title (title),
    INDEX idx_author (author),
    INDEX idx_status (status),
    INDEX idx_published (is_published),
    INDEX idx_created_at (created_at)
);

-- Manga genres junction table
CREATE TABLE manga_genres (
    manga_id VARCHAR(36),
    genre_id VARCHAR(36),
    PRIMARY KEY (manga_id, genre_id),
    FOREIGN KEY (manga_id) REFERENCES manga(id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE
);

-- Chapters table
CREATE TABLE chapters (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    manga_id VARCHAR(36) NOT NULL,
    chapter_number INT NOT NULL,
    title VARCHAR(255),
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(36) NOT NULL,
    FOREIGN KEY (manga_id) REFERENCES manga(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    UNIQUE KEY unique_chapter (manga_id, chapter_number),
    INDEX idx_manga_chapter (manga_id, chapter_number)
);

-- Pages table
CREATE TABLE pages (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    chapter_id VARCHAR(36) NOT NULL,
    page_number INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    alt_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
    UNIQUE KEY unique_page (chapter_id, page_number),
    INDEX idx_chapter_page (chapter_id, page_number)
);

-- Activity logs table
CREATE TABLE activity_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36),
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(50) NOT NULL,
    resource_id VARCHAR(36),
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_action (user_id, action),
    INDEX idx_resource (resource, resource_id),
    INDEX idx_created_at (created_at)
);

-- System notifications table
CREATE TABLE system_notifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    type ENUM('info', 'warning', 'error', 'success') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    user_id VARCHAR(36) NULL, -- NULL means global notification
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_read (user_id, is_read),
    INDEX idx_type_created (type, created_at)
);
```

### 4. Initial Data Setup

```sql
-- Insert default roles
INSERT INTO roles (id, name, description) VALUES 
('role-admin', 'admin', 'Full system administrator'),
('role-moderator', 'moderator', 'Content moderator'),
('role-user', 'user', 'Regular user');

-- Insert permissions
INSERT INTO permissions (id, name, resource, action, description) VALUES 
-- Manga permissions
('perm-manga-create', 'Create Manga', 'manga', 'create', 'Create new manga'),
('perm-manga-read', 'Read Manga', 'manga', 'read', 'View manga content'),
('perm-manga-update', 'Update Manga', 'manga', 'update', 'Edit manga information'),
('perm-manga-delete', 'Delete Manga', 'manga', 'delete', 'Remove manga'),
('perm-manga-manage', 'Manage Manga', 'manga', 'manage', 'Full manga management'),

-- User permissions
('perm-user-create', 'Create User', 'user', 'create', 'Create new users'),
('perm-user-read', 'Read User', 'user', 'read', 'View user information'),
('perm-user-update', 'Update User', 'user', 'update', 'Edit user information'),
('perm-user-delete', 'Delete User', 'user', 'delete', 'Remove users'),
('perm-user-manage', 'Manage User', 'user', 'manage', 'Full user management'),

-- Role permissions
('perm-role-manage', 'Manage Roles', 'role', 'manage', 'Manage user roles and permissions'),

-- Dashboard permissions
('perm-dashboard-read', 'Dashboard Access', 'dashboard', 'read', 'Access to dashboard');

-- Assign permissions to admin role
INSERT INTO role_permissions (role_id, permission_id) VALUES 
('role-admin', 'perm-manga-create'),
('role-admin', 'perm-manga-read'),
('role-admin', 'perm-manga-update'),
('role-admin', 'perm-manga-delete'),
('role-admin', 'perm-manga-manage'),
('role-admin', 'perm-user-create'),
('role-admin', 'perm-user-read'),
('role-admin', 'perm-user-update'),
('role-admin', 'perm-user-delete'),
('role-admin', 'perm-user-manage'),
('role-admin', 'perm-role-manage'),
('role-admin', 'perm-dashboard-read');

-- Assign permissions to moderator role
INSERT INTO role_permissions (role_id, permission_id) VALUES 
('role-moderator', 'perm-manga-create'),
('role-moderator', 'perm-manga-read'),
('role-moderator', 'perm-manga-update'),
('role-moderator', 'perm-manga-delete'),
('role-moderator', 'perm-dashboard-read');

-- Assign permissions to user role
INSERT INTO role_permissions (role_id, permission_id) VALUES 
('role-user', 'perm-manga-read');

-- Create default admin user (password: admin123)
INSERT INTO users (id, username, email, password_hash, status) VALUES 
('user-admin', 'admin', 'admin@comicreader.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'active');

-- Create default moderator user (password: mod123)
INSERT INTO users (id, username, email, password_hash, status) VALUES 
('user-moderator', 'moderator', 'mod@comicreader.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'active');

-- Assign roles to users
INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES 
('user-admin', 'role-admin', 'user-admin'),
('user-moderator', 'role-moderator', 'user-admin');

-- Insert some sample genres
INSERT INTO genres (name, description) VALUES 
('Action', 'Action manga with fights and adventures'),
('Romance', 'Love stories and romantic relationships'),
('Comedy', 'Funny and humorous manga'),
('Drama', 'Dramatic storylines with emotional depth'),
('Fantasy', 'Magic and fantasy worlds'),
('Sci-Fi', 'Science fiction and futuristic themes');
```

## Migration Steps

### 1. Backend Setup
1. Create new Jakarta EE 11 project with above structure
2. Configure MySQL connection pool
3. Implement JWT authentication
4. Create RBAC filter for API endpoints
5. Implement all servlet endpoints

### 2. Database Migration
1. Run the MySQL schema creation script
2. Execute initial data setup
3. Configure connection parameters
4. Test database connectivity

### 3. Frontend Integration
1. Update API endpoints to point to Jakarta EE backend
2. Implement JWT token management
3. Add RBAC permission checks in UI
4. Test all dashboard functionalities

### 4. Security Configuration
1. Configure CORS for frontend domain
2. Set up JWT secret key
3. Configure password hashing
4. Implement activity logging

### 5. Deployment
1. Build WAR file
2. Deploy to Jakarta EE 11 compatible server (Tomcat 10.1+)
3. Configure MySQL data source
4. Set environment variables
5. Test production deployment

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/me` - Get current user info

### Users (Admin only)
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user
- `PUT /api/users/{id}/role` - Change user role

### Manga (Admin/Moderator)
- `GET /api/manga` - List manga
- `POST /api/manga` - Create manga
- `PUT /api/manga/{id}` - Update manga
- `DELETE /api/manga/{id}` - Delete manga
- `POST /api/manga/{id}/chapters` - Add chapter

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/activity` - Get recent activity

This structure provides a solid foundation for a RBAC-enabled manga management system using Jakarta EE 11 and MySQL.