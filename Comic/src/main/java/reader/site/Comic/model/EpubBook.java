package reader.site.Comic.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "epub_books")
public class EpubBook {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, length = 64)
    private String userId; // ID của người dùng sở hữu

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "file_size_in_bytes", nullable = false)
    private long fileSizeInBytes; // Để kiểm soát hạn mức 500MB

    @Column(name = "blob_name", nullable = false, length = 40) // UUID length
    private String blobName;  // Đường dẫn đến tệp tin trên server

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