package reader.site.Comic.service;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * Interface chung cho mọi backend lưu trữ file EPUB.
 */
public interface StorageService {

    /**
     * Lưu file.
     * @return true nếu thành công
     */
    boolean uploadFile(InputStream inputStream, String fileName, long fileSize);

    /** Kiểm tra file có tồn tại không. */
    boolean exists(String fileName);

    /** Lấy kích thước file (bytes). */
    long getFileSize(String fileName) throws IOException;

    /** Stream nội dung file ra OutputStream. */
    void streamFile(String fileName, OutputStream out) throws IOException;

    /** Xóa file. */
    boolean deleteFile(String fileName);
}
