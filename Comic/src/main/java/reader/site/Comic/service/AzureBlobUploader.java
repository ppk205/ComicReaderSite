package reader.site.Comic.service;

import reader.site.Comic.util.EnvConfig;

import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * AzureBlobUploader — implements StorageService.
 * Connection string is loaded from the environment variable AZURE_BLOB_CONNECTION_STRING.
 * Container name defaults to "temp" but can be overridden via AZURE_BLOB_CONTAINER.
 */
public class AzureBlobUploader implements StorageService {

    private final BlobContainerClient containerClient;

    public AzureBlobUploader() {
        String connectionString = EnvConfig.azureBlobConnectionString();
        String containerName    = EnvConfig.azureBlobContainer();

        BlobServiceClient blobServiceClient = new BlobServiceClientBuilder()
                .connectionString(connectionString)
                .buildClient();

        containerClient = blobServiceClient.getBlobContainerClient(containerName);
        if (!containerClient.exists()) {
            containerClient.create();
        }
        System.out.println("[AzureBlobUploader] Initialized for container: " + containerName);
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