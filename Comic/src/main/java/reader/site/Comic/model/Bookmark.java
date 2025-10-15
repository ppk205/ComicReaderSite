package reader.site.Comic.model;

public class Bookmark {
    private String mangaId;
    private String title;
    private String cover;
    private Integer currentChapter;
    private Integer totalChapters;
    private Double readingProgress;

    public String getMangaId() { return mangaId; }
    public void setMangaId(String mangaId) { this.mangaId = mangaId; }

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
}
