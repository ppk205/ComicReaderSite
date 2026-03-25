package reader.site.Comic.model;

public class Permission {
    private String id;
    private String name;
    private String resource;
    private String action;
    private String description;

    public Permission() {}

    public Permission(String id, String name, String resource, String action, String description) {
        this.id = id;
        this.name = name;
        this.resource = resource;
        this.action = action;
        this.description = description;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getResource() {
        return resource;
    }

    public void setResource(String resource) {
        this.resource = resource;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
