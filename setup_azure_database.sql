-- Azure MySQL Database Setup Script
-- Database: comicdb
-- Host: websql1.mysql.database.azure.com
-- User: ppk123
-- Password: Mysql@1234

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS comicdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE comicdb;

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS reading_history;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS manga_chapters;
DROP TABLE IF EXISTS manga;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

-- Create roles table
CREATE TABLE roles (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create users table
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(128) NOT NULL UNIQUE,
    email VARCHAR(128) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    status VARCHAR(32) DEFAULT 'active',
    created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    last_login DATETIME(6),
    role_id VARCHAR(64),
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_role_id (role_id),
    CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create permissions table
CREATE TABLE permissions (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create role_permissions junction table
CREATE TABLE role_permissions (
    role_id VARCHAR(64),
    permission_id VARCHAR(64),
    created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_permission_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_role_permission_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create posts table
CREATE TABLE posts (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    status VARCHAR(32) DEFAULT 'published',
    created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    CONSTRAINT fk_post_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create manga table
CREATE TABLE manga (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    author VARCHAR(128),
    cover_image VARCHAR(512),
    status VARCHAR(32) DEFAULT 'ongoing',
    created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX idx_title (title),
    INDEX idx_author (author),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create manga_chapters table
CREATE TABLE manga_chapters (
    id VARCHAR(64) PRIMARY KEY,
    manga_id VARCHAR(64),
    chapter_number INT NOT NULL,
    title VARCHAR(255),
    content TEXT,
    created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_manga_id (manga_id),
    INDEX idx_chapter_number (chapter_number),
    CONSTRAINT fk_chapter_manga FOREIGN KEY (manga_id) REFERENCES manga(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create comments table
CREATE TABLE comments (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    manga_id VARCHAR(64),
    content TEXT NOT NULL,
    created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX idx_user_id (user_id),
    INDEX idx_manga_id (manga_id),
    CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_manga FOREIGN KEY (manga_id) REFERENCES manga(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create reading_history table
CREATE TABLE reading_history (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    manga_id VARCHAR(64),
    chapter_id VARCHAR(64),
    last_read_page INT DEFAULT 0,
    created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX idx_user_id (user_id),
    INDEX idx_manga_id (manga_id),
    CONSTRAINT fk_history_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_history_manga FOREIGN KEY (manga_id) REFERENCES manga(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default roles
INSERT INTO roles (id, name, description) VALUES
('1', 'user', 'Regular user with basic permissions'),
('2', 'admin', 'Administrator with full permissions'),
('3', 'moderator', 'Moderator with content management permissions');

-- Insert default permissions
INSERT INTO permissions (id, name, description) VALUES
('1', 'read_manga', 'Can read manga content'),
('2', 'comment', 'Can post comments'),
('3', 'manage_users', 'Can manage user accounts'),
('4', 'manage_content', 'Can manage manga content'),
('5', 'manage_comments', 'Can moderate comments');

-- Assign permissions to roles
INSERT INTO role_permissions (role_id, permission_id) VALUES
('1', '1'), -- user can read manga
('1', '2'), -- user can comment
('2', '1'), -- admin can read manga
('2', '2'), -- admin can comment
('2', '3'), -- admin can manage users
('2', '4'), -- admin can manage content
('2', '5'), -- admin can manage comments
('3', '1'), -- moderator can read manga
('3', '2'), -- moderator can comment
('3', '4'), -- moderator can manage content
('3', '5'); -- moderator can manage comments

-- Insert sample users (password is 'password123' - remember to hash in production)
INSERT INTO users (id, username, email, password, status, role_id) VALUES
('1', 'admin', 'admin@comic.com', 'password123', 'active', '2'),
('2', 'testuser', 'test@comic.com', 'password123', 'active', '1'),
('3', 'moderator', 'mod@comic.com', 'password123', 'active', '3');

-- Insert sample manga
INSERT INTO manga (id, title, description, author, status) VALUES
('1', 'One Piece', 'A story about pirates and adventure', 'Eiichiro Oda', 'ongoing'),
('2', 'Naruto', 'A ninja story', 'Masashi Kishimoto', 'completed'),
('3', 'Bleach', 'Soul Reapers fighting Hollows', 'Tite Kubo', 'completed');

-- Show table structure
SHOW TABLES;

-- Display users
SELECT id, username, email, status, role_id, created_at FROM users;

-- Display roles
SELECT * FROM roles;

-- Display permissions
SELECT * FROM permissions;

COMMIT;

