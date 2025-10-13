package reader.site.Comic.model;

public class ActivityItem {
    private String id;
    private String type;
    private String message;
    private String timestamp;

    public ActivityItem() {}

    public ActivityItem(String id, String type, String message, String timestamp) {
        this.id = id;
        this.type = type;
        this.message = message;
        this.timestamp = timestamp;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
}
