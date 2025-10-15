package reader.site.Comic.model;

public class Bookmark {
    private String id;
    private String mangaId;
    private String title;
    private String cover;
    private Integer currentChapter;
    private Integer totalChapters;
    private Double readingProgress;
    private String createdAt;
    private String updatedAt;

    public String getMangaId() { return mangaId; }
    public void setMangaId(String mangaId) { this.mangaId = mangaId; }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCover() { return cover; }
    public void setCover(String cover) { this.cover = cover; }

    public Integer getCurrentChapter() { return currentChapter; }
    public void setCurrentChapter(Integer currentChapter) { this.currentChapter = currentChapter; }

    public Integer getTotalChapters() { return totalChapters; }
    public void setTotalChapters(Integer totalChapters) { this.totalChapters = totalChapters; }

    public Double getReadingProgress() { return readingProgress; }
    public void setReadingProgress(Double readingProgress) { this.readingProgress = readingProgress; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}