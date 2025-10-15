package reader.site.Comic.service;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.azure.storage.blob.models.BlobStorageException;

import java.io.InputStream;

public class AzureBlobUploader {

    private static final String CONNECTION_STRING = "DefaultEndpointsProtocol=https;AccountName=typoo06;AccountKey=cuo0NsaO7kucN8FO2w4u57Fzf1rSgP04A+gSLhSZsslH1uvdaBtXsead6iwGq9w4J5huCFp4qdCu+AStPQjP7A==;EndpointSuffix=core.windows.net";
    private static final String CONTAINER_NAME = "temp";

    private final BlobContainerClient containerClient;

    public AzureBlobUploader() {
        BlobServiceClient blobServiceClient = new BlobServiceClientBuilder()
                .connectionString(CONNECTION_STRING)
                .buildClient();

        containerClient = blobServiceClient.getBlobContainerClient(CONTAINER_NAME);
        // Đảm bảo container tồn tại (chỉ cần gọi một lần khi khởi tạo hệ thống)
        if (!containerClient.exists()) {
            containerClient.create();
        }
        System.out.println("Azure Blob Storage client initialized for container: " + CONTAINER_NAME);
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
            if (!blobClient.exists()) {
                System.out.println("Blob not found: " + blobName);
                return false;
            }
            blobClient.delete();
            System.out.println("Deleted blob: " + blobName);
            return true;
        } catch (BlobStorageException e) {
            System.err.println("Azure error deleting blob: " + e.getErrorCode() + " - " + e.getMessage());
            return false;
        } catch (Exception e) {
            System.err.println("Unexpected error deleting blob: " + e.getMessage());
            return false;
        }
    }
}