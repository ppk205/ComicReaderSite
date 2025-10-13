package reader.site.Comic.model;

public class DashboardStats {
    private int totalUsers;
    private int activeUsers;
    private int totalManga;
    private int publishedManga;
    private int totalChapters;
    private long totalViews;
    private int newUsersThisMonth;
    private int newMangaThisMonth;

    public int getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(int totalUsers) {
        this.totalUsers = totalUsers;
    }

    public int getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(int activeUsers) {
        this.activeUsers = activeUsers;
    }

    public int getTotalManga() {
        return totalManga;
    }

    public void setTotalManga(int totalManga) {
        this.totalManga = totalManga;
    }

    public int getPublishedManga() {
        return publishedManga;
    }

    public void setPublishedManga(int publishedManga) {
        this.publishedManga = publishedManga;
    }

    public int getTotalChapters() {
        return totalChapters;
    }

    public void setTotalChapters(int totalChapters) {
        this.totalChapters = totalChapters;
    }

    public long getTotalViews() {
        return totalViews;
    }

    public void setTotalViews(long totalViews) {
        this.totalViews = totalViews;
    }

    public int getNewUsersThisMonth() {
        return newUsersThisMonth;
    }

    public void setNewUsersThisMonth(int newUsersThisMonth) {
        this.newUsersThisMonth = newUsersThisMonth;
    }

    public int getNewMangaThisMonth() {
        return newMangaThisMonth;
    }

    public void setNewMangaThisMonth(int newMangaThisMonth) {
        this.newMangaThisMonth = newMangaThisMonth;
    }
}
