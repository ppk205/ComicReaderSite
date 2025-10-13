package reader.site.Comic.model;

import java.time.LocalDateTime;

public class ReadingHistory {
    private String id;
    private String userId;
    private String comicId;
    private String comicTitle;
    private String comicCover;
    private int lastChapter;
    private int totalChapters;
    private boolean isCompleted;
    private String status; // "reading", "completed", "plan_to_read", "dropped"
    private LocalDateTime lastReadTime;
    private LocalDateTime createdAt;
    private double progress; // percentage (0-100)

    // Default constructor
    public ReadingHistory() {
        this.createdAt = LocalDateTime.now();
        this.lastReadTime = LocalDateTime.now();
    }

    // Constructor with basic fields
    public ReadingHistory(String userId, String comicId, String comicTitle, String comicCover) {
        this();
        this.userId = userId;
        this.comicId = comicId;
        this.comicTitle = comicTitle;
        this.comicCover = comicCover;
        this.lastChapter = 0;
        this.isCompleted = false;
        this.status = "reading";
        this.progress = 0.0;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getComicId() {
        return comicId;
    }

    public void setComicId(String comicId) {
        this.comicId = comicId;
    }

    public String getComicTitle() {
        return comicTitle;
    }

    public void setComicTitle(String comicTitle) {
        this.comicTitle = comicTitle;
    }

    public String getComicCover() {
        return comicCover;
    }

    public void setComicCover(String comicCover) {
        this.comicCover = comicCover;
    }

    public int getLastChapter() {
        return lastChapter;
    }

    public void setLastChapter(int lastChapter) {
        this.lastChapter = lastChapter;
        updateProgress();
        updateLastReadTime();
    }

    public int getTotalChapters() {
        return totalChapters;
    }

    public void setTotalChapters(int totalChapters) {
        this.totalChapters = totalChapters;
        updateProgress();
    }

    public boolean isCompleted() {
        return isCompleted;
    }

    public void setCompleted(boolean completed) {
        isCompleted = completed;
        if (completed) {
            this.status = "completed";
            this.progress = 100.0;
        }
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
        if ("completed".equals(status)) {
            this.isCompleted = true;
            this.progress = 100.0;
        }
    }

    public LocalDateTime getLastReadTime() {
        return lastReadTime;
    }

    public void setLastReadTime(LocalDateTime lastReadTime) {
        this.lastReadTime = lastReadTime;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public double getProgress() {
        return progress;
    }

    public void setProgress(double progress) {
        this.progress = progress;
    }

    // Helper methods
    private void updateProgress() {
        if (totalChapters > 0) {
            this.progress = ((double) lastChapter / totalChapters) * 100.0;
            if (this.progress >= 100.0) {
                this.progress = 100.0;
                this.isCompleted = true;
                this.status = "completed";
            }
        }
    }

    private void updateLastReadTime() {
        this.lastReadTime = LocalDateTime.now();
    }

    public String getReadingStatusText() {
        switch (status) {
            case "completed":
                return "Completed";
            case "reading":
                return "Reading";
            case "plan_to_read":
                return "Plan to read";
            case "dropped":
                return "Dropped";
            default:
                return "None";
        }
    }

    public String getProgressText() {
        if (isCompleted) {
            return "Completed";
        }
        return String.format("Chương %d/%d (%.1f%%)", lastChapter, totalChapters, progress);
    }
}
