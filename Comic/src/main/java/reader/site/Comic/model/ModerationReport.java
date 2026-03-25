package reader.site.Comic.model;

public class ModerationReport {
    private String id;
    private String reporter;
    private String reason;
    private String targetTitle;
    private String status;
    private String createdAt;

    public ModerationReport() {}

    public ModerationReport(String id,
                             String reporter,
                             String reason,
                             String targetTitle,
                             String status,
                             String createdAt) {
        this.id = id;
        this.reporter = reporter;
        this.reason = reason;
        this.targetTitle = targetTitle;
        this.status = status;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getReporter() {
        return reporter;
    }

    public void setReporter(String reporter) {
        this.reporter = reporter;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getTargetTitle() {
        return targetTitle;
    }

    public void setTargetTitle(String targetTitle) {
        this.targetTitle = targetTitle;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
