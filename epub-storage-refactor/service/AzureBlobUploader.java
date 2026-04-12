package reader.site.Comic.service;

import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * AzureBlobUploader — implement StorageService (thay vì class độc lập như bản gốc).
 * Thêm method isAvailable() để HybridStorageService kiểm tra trước khi upload.
 */
public class AzureBlobUploader implements StorageService {

    private static final String CONNECTION_STRING = "DefaultEndpointsProtocol=https;AccountName=typoo06;AccountKey=cuo0NsaO7kucN8FO2w4u57Fzf1rSgP04A+gSLhSZsslH1uvdaBtXsead6iwGq9w4J5huCFp4qdCu+AStPQjP7A==;EndpointSuffix=core.windows.net";
    private static final String CONTAINER_NAME = "temp";

    private final BlobContainerClient containerClient;

    public AzureBlobUploader() {
        BlobServiceClient blobServiceClient = new BlobServiceClientBuilder()
                .connectionString(CONNECTION_STRING)
                .buildClient();

        containerClient = blobServiceClient.getBlobContainerClient(CONTAINER_NAME);
        if (!containerClient.exists()) {
            containerClient.create();
        }
        System.out.println("[AzureBlobUploader] Initialized for container: " + CONTAINER_NAME);
    }

    @Override
    public boolean uploadFile(InputStream inputStream, String fileName, long fileSize) {
        try {
            containerClient.getBlobClient(fileName).upload(inputStream, fileSize, true);
            return true;
        } catch (Exception e) {
            System.err.println("[AzureBlobUploader] Upload error: " + e.getMessage());
            return false;
        }
    }

    @Override
    public boolean exists(String fileName) {
        try {
            return containerClient.getBlobClient(fileName).exists();
        } catch (Exception e) {
            System.err.println("[AzureBlobUploader] exists() error: " + e.getMessage());
            return false;
        }
    }

    @Override
    public long getFileSize(String fileName) throws IOException {
        try {
            return containerClient.getBlobClient(fileName).getProperties().getBlobSize();
        } catch (Exception e) {
            throw new IOException("Cannot get file size from Azure: " + e.getMessage(), e);
        }
    }

    @Override
    public void streamFile(String fileName, OutputStream out) throws IOException {
        try {
            containerClient.getBlobClient(fileName).download(out);
        } catch (Exception e) {
            throw new IOException("Cannot stream file from Azure: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean deleteFile(String fileName) {
        try {
            var blobClient = containerClient.getBlobClient(fileName);
            if (blobClient.exists()) blobClient.delete();
            return true;
        } catch (Exception e) {
            System.err.println("[AzureBlobUploader] Delete error: " + e.getMessage());
            return false;
        }
    }

    /**
     * Kiểm tra nhanh xem Azure có đang hoạt động không.
     * Dùng bởi HybridStorageService trước khi quyết định upload.
     */
    public boolean isAvailable() {
        try {
            containerClient.exists();
            return true;
        } catch (Exception e) {
            System.err.println("[AzureBlobUploader] Not available: " + e.getMessage());
            return false;
        }
    }
}
