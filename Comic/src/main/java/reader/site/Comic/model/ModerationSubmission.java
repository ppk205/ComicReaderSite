package reader.site.Comic.model;

public class ModerationSubmission {
    private String id;
    private String title;
    private String uploader;
    private int chapters;
    private String submittedAt;
    private String status;

    public ModerationSubmission() {}

    public ModerationSubmission(String id,
                                 String title,
                                 String uploader,
                                 int chapters,
                                 String submittedAt,
                                 String status) {
        this.id = id;
        this.title = title;
        this.uploader = uploader;
        this.chapters = chapters;
        this.submittedAt = submittedAt;
        this.status = status;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getUploader() {
        return uploader;
    }

    public void setUploader(String uploader) {
        this.uploader = uploader;
    }

    public int getChapters() {
        return chapters;
    }

    public void setChapters(int chapters) {
        this.chapters = chapters;
    }

    public String getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(String submittedAt) {
        this.submittedAt = submittedAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
