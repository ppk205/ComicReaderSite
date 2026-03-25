package reader.site.Comic.model;

public class ChapterImage {
    private String url;
    private int order;

    public ChapterImage() {}

    public ChapterImage(String url, int order) {
        this.url = url;
        this.order = order;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public int getOrder() {
        return order;
    }

    public void setOrder(int order) {
        this.order = order;
    }
}
