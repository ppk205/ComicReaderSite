package reader.site.Comic.service;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

/**
 * Lưu file EPUB trực tiếp trên ổ đĩa local (fallback khi Azure không khả dụng).
 *
 * Thư mục lưu (theo thứ tự ưu tiên):
 *   1. Biến môi trường  EPUB_STORAGE_DIR
 *   2. ${catalina.home}/epub-storage/   (mặc định khi chạy trên Tomcat)
 *   3. ${user.home}/epub-storage/       (fallback cuối cùng)
 */
public class LocalFileStorage implements StorageService {

    private final Path storageDir;

    public LocalFileStorage() throws IOException {
        String customDir = System.getenv("EPUB_STORAGE_DIR");
        if (customDir != null && !customDir.isBlank()) {
            storageDir = Paths.get(customDir);
        } else {
            String base = System.getProperty("catalina.home", System.getProperty("user.home"));
            storageDir = Paths.get(base, "epub-storage");
        }
        Files.createDirectories(storageDir);
        System.out.println("[LocalFileStorage] Storage directory: " + storageDir.toAbsolutePath());
    }

    @Override
    public boolean uploadFile(InputStream inputStream, String fileName, long fileSize) {
        try {
            Path dest = storageDir.resolve(fileName);
            Files.copy(inputStream, dest, StandardCopyOption.REPLACE_EXISTING);
            System.out.println("[LocalFileStorage] Saved: " + dest.toAbsolutePath());
            return true;
        } catch (IOException e) {
            System.err.println("[LocalFileStorage] Upload error: " + e.getMessage());
            return false;
        }
    }

    @Override
    public boolean exists(String fileName) {
        return Files.exists(storageDir.resolve(fileName));
    }

    @Override
    public long getFileSize(String fileName) throws IOException {
        return Files.size(storageDir.resolve(fileName));
    }

    @Override
    public void streamFile(String fileName, OutputStream out) throws IOException {
        Files.copy(storageDir.resolve(fileName), out);
    }

    @Override
    public boolean deleteFile(String fileName) {
        try {
            boolean deleted = Files.deleteIfExists(storageDir.resolve(fileName));
            if (deleted) System.out.println("[LocalFileStorage] Deleted: " + fileName);
            return true;
        } catch (IOException e) {
            System.err.println("[LocalFileStorage] Delete error: " + e.getMessage());
            return false;
        }
    }
}
