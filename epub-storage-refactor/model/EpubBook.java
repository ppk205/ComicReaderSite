package reader.site.Comic.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * THAY ĐỔI SO VỚI BẢN GỐC:
 *   - Cột blob_name tăng length từ 40 → 50
 *     để chứa prefix "az:" hoặc "lc:" trước UUID.epub
 *     Ví dụ: "az:abcdef1234567890abcdef1234567890.epub"  (43 ký tự)
 *             "lc:abcdef1234567890abcdef1234567890.epub"  (43 ký tự)
 */
@Entity
@Table(name = "epub_books")
public class EpubBook {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, length = 64)
    private String userId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "file_size_in_bytes", nullable = false)
    private long fileSizeInBytes;

    // THAY ĐỔI: length 40 → 50 để chứa prefix "az:" / "lc:"
    @Column(name = "blob_name", nullable = false, length = 50)
    private String blobName;  // storedKey: "az:<uuid>.epub" hoặc "lc:<uuid>.epub"

    @Column(name = "upload_date", nullable = false)
    private LocalDateTime uploadDate = LocalDateTime.now();

    // Constructors
    public EpubBook() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public long getFileSizeInBytes() { return fileSizeInBytes; }
    public void setFileSizeInBytes(long fileSizeInBytes) { this.fileSizeInBytes = fileSizeInBytes; }

    public String getBlobName() { return blobName; }
    public void setBlobName(String blobName) { this.blobName = blobName; }

    public LocalDateTime getUploadDate() { return uploadDate; }
    public void setUploadDate(LocalDateTime uploadDate) { this.uploadDate = uploadDate; }
}
