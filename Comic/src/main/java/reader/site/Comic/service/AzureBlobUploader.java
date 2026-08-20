package reader.site.Comic.service;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import reader.site.Comic.util.EnvConfig;

import java.io.InputStream;

/**
 * Azure Blob Storage helper.
 * The connection string comes from the AZURE_BLOB_CONNECTION_STRING environment
 * variable — never hardcode storage keys in source code.
 */
public class AzureBlobUploader {

    private final BlobContainerClient containerClient;

    public AzureBlobUploader() {
        String connectionString = EnvConfig.azureBlobConnectionString();
        String containerName = EnvConfig.azureBlobContainer();

        BlobServiceClient blobServiceClient = new BlobServiceClientBuilder()
                .connectionString(connectionString)
                .buildClient();

        containerClient = blobServiceClient.getBlobContainerClient(containerName);
        // Đảm bảo container tồn tại (chỉ cần gọi một lần khi khởi tạo hệ thống)
        if (!containerClient.exists()) {
            containerClient.create();
        }
        System.out.println("Azure Blob Storage client initialized for container: " + containerName);
    }

    /**
     * Upload file lên Azure Blob Storage.
     * @param inputStream Dữ liệu file đầu vào
     * @param blobName Tên duy nhất của blob (ví dụ: UUID.epub)
     * @param fileSize Kích thước file
     * @return true nếu upload thành công
     */
    public boolean uploadFile(InputStream inputStream, String blobName, long fileSize) {
        BlobClient blobClient = containerClient.getBlobClient(blobName);
        try {
            // Upload và ghi đè nếu đã tồn tại
            blobClient.upload(inputStream, fileSize, true);
            return true;
        } catch (Exception e) {
            System.err.println("Error uploading file to Azure: " + e.getMessage());
            return false;
        }
    }

    /**
     * Lấy BlobClient để đọc/stream file từ Azure.
     * @param blobName Tên blob duy nhất
     * @return BlobClient
     */
    public BlobClient getBlobClient(String blobName) {
        return containerClient.getBlobClient(blobName);
    }

    /**
     * Xóa file khỏi Azure Blob Storage.
     * @param blobName Tên blob duy nhất
     * @return true nếu xóa thành công hoặc file không tồn tại
     */
    public boolean deleteFile(String blobName) {
        BlobClient blobClient = containerClient.getBlobClient(blobName);
        try {
            if (blobClient.exists()) {
                blobClient.delete();
                return true;
            }
            return false;
        } catch (Exception e) {
            System.err.println("Error deleting file from Azure: " + e.getMessage());
            return false;
        }
    }
}
