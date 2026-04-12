package reader.site.Comic.service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * StorageService kết hợp Azure + Local Disk với cơ chế fallback tự động.
 *
 * ─── Quy ước prefix trong tên file lưu ở DB (cột blob_name) ───────────────
 *   "az:<uuid>.epub"  → file đang ở Azure Blob Storage
 *   "lc:<uuid>.epub"  → file đang ở Local Disk
 *   "<uuid>.epub"     → legacy (record cũ, không có prefix) → xử lý như Azure
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ─── Luồng UPLOAD ────────────────────────────────────────────────────────────
 *   1. Gọi azure.isAvailable()
 *   2. Nếu Azure OK  → upload Azure → trả về "az:<uuid>.epub"
 *   3. Nếu Azure KO  → upload Local → trả về "lc:<uuid>.epub"
 *   4. Cả hai thất bại → ném Exception
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ─── Luồng READ / DELETE ────────────────────────────────────────────────────
 *   → Đọc prefix của storedKey để chọn đúng backend
 * ─────────────────────────────────────────────────────────────────────────────
 */
public class HybridStorageService {

    public static final String AZURE_PREFIX = "az:";
    public static final String LOCAL_PREFIX  = "lc:";

    private final AzureBlobUploader azure;
    private final LocalFileStorage  local;

    public HybridStorageService(AzureBlobUploader azure, LocalFileStorage local) {
        this.azure = azure;
        this.local = local;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UPLOAD
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Upload file: Azure trước, Local làm fallback.
     *
     * @param inputStream Dữ liệu file
     * @param baseName    Tên file (UUID.epub)
     * @param fileSize    Kích thước file
     * @return storedKey có prefix, ví dụ "az:abc123.epub" hoặc "lc:abc123.epub"
     * @throws Exception nếu cả hai backend đều thất bại
     */
    public String upload(InputStream inputStream, String baseName, long fileSize) throws Exception {
        // Đọc toàn bộ data vào memory để có thể thử lại nếu Azure thất bại
        byte[] data = inputStream.readAllBytes();

        // Thử Azure
        if (azure.isAvailable()) {
            boolean ok = azure.uploadFile(new ByteArrayInputStream(data), baseName, fileSize);
            if (ok) {
                System.out.println("[HybridStorage] Uploaded to Azure: " + baseName);
                return AZURE_PREFIX + baseName;
            }
            System.err.println("[HybridStorage] Azure upload failed, falling back to local disk.");
        } else {
            System.err.println("[HybridStorage] Azure unavailable, falling back to local disk.");
        }

        // Fallback → Local Disk
        boolean ok = local.uploadFile(new ByteArrayInputStream(data), baseName, fileSize);
        if (ok) {
            System.out.println("[HybridStorage] Uploaded to local disk: " + baseName);
            return LOCAL_PREFIX + baseName;
        }

        throw new Exception("Both Azure and local storage failed to save the file.");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // READ / DELETE — delegate đến đúng backend qua prefix
    // ─────────────────────────────────────────────────────────────────────────

    public boolean exists(String storedKey) {
        StorageService backend = resolveBackend(storedKey);
        return backend != null && backend.exists(stripPrefix(storedKey));
    }

    public long getFileSize(String storedKey) throws IOException {
        return requireBackend(storedKey).getFileSize(stripPrefix(storedKey));
    }

    public void streamFile(String storedKey, OutputStream out) throws IOException {
        requireBackend(storedKey).streamFile(stripPrefix(storedKey), out);
    }

    public boolean deleteFile(String storedKey) {
        StorageService backend = resolveBackend(storedKey);
        if (backend == null) {
            System.err.println("[HybridStorage] Unknown prefix in storedKey: " + storedKey);
            return false;
        }
        return backend.deleteFile(stripPrefix(storedKey));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    private StorageService resolveBackend(String storedKey) {
        if (storedKey == null) return null;
        if (storedKey.startsWith(AZURE_PREFIX)) return azure;
        if (storedKey.startsWith(LOCAL_PREFIX))  return local;
        // Legacy record không có prefix → coi là Azure (bản gốc)
        System.out.println("[HybridStorage] No prefix, treating as legacy Azure blob: " + storedKey);
        return azure;
    }

    private StorageService requireBackend(String storedKey) throws IOException {
        StorageService b = resolveBackend(storedKey);
        if (b == null) throw new IOException("Cannot resolve backend for: " + storedKey);
        return b;
    }

    private String stripPrefix(String storedKey) {
        if (storedKey.startsWith(AZURE_PREFIX)) return storedKey.substring(AZURE_PREFIX.length());
        if (storedKey.startsWith(LOCAL_PREFIX))  return storedKey.substring(LOCAL_PREFIX.length());
        return storedKey; // legacy
    }
}
