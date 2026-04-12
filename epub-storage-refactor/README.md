# EPUB Storage Refactor — Review Draft

Thư mục này chứa các file **MỚI** để review. Code gốc trong project **không bị thay đổi**.

---

## Mục tiêu

Thêm cơ chế **Azure Blob → Local Disk fallback** cho việc lưu trữ EPUB:

- Nếu Azure khả dụng → upload lên Azure (như cũ)
- Nếu Azure không khả dụng (hết hạn, hết dung lượng, lỗi mạng) → tự động lưu xuống Local Disk

---

## Cấu trúc thư mục này

```
epub-storage-refactor/
├── service/
│   ├── StorageService.java        ← Interface chung (MỚI)
│   ├── AzureBlobUploader.java     ← Implement StorageService + thêm isAvailable() (SỬA)
│   ├── LocalFileStorage.java      ← Backend lưu local disk (MỚI)
│   └── HybridStorageService.java  ← Fallback logic (MỚI)
├── servlet/
│   └── EpubServlet.java           ← Dùng HybridStorageService thay vì Azure trực tiếp (SỬA)
├── model/
│   └── EpubBook.java              ← Tăng blob_name length 40→50 (SỬA nhỏ)
└── README.md
```

---

## Luồng hoạt động

### Upload
```
Client → POST /api/epub
           ↓
     HybridStorageService.upload()
           ↓
     azure.isAvailable()?
     ├── YES → azure.uploadFile() → OK?
     │           ├── YES → lưu "az:{uuid}.epub" vào DB
     │           └── NO  → fallback local
     └── NO  → local.uploadFile() → lưu "lc:{uuid}.epub" vào DB
```

### Download / Delete
```
DB.blobName = "az:abc123.epub" → dùng AzureBlobUploader
DB.blobName = "lc:abc123.epub" → dùng LocalFileStorage
DB.blobName = "abc123.epub"    → legacy (record cũ) → dùng Azure
```

---

## Những file cần thay đổi trong project thật

| File | Thay đổi |
|------|----------|
| `service/AzureBlobUploader.java` | implement `StorageService`, thêm `isAvailable()` |
| `service/StorageService.java` | tạo mới |
| `service/LocalFileStorage.java` | tạo mới |
| `service/HybridStorageService.java` | tạo mới |
| `servlet/EpubServlet.java` | dùng `HybridStorageService` thay `AzureBlobUploader` |
| `model/EpubBook.java` | `blob_name` length: `40` → `50` |
| DB | `ALTER TABLE epub_books MODIFY blob_name VARCHAR(50);` |

---

## SQL cần chạy khi áp dụng

```sql
ALTER TABLE epub_books MODIFY COLUMN blob_name VARCHAR(50) NOT NULL;
```

> Record cũ (không có prefix) sẽ tự động được coi là Azure blob khi đọc.

---

## Thư mục lưu file local (mặc định)

```
%CATALINA_HOME%\epub-storage\
```

Tùy chỉnh qua biến môi trường:
```
EPUB_STORAGE_DIR=D:\my-epub-storage
```
