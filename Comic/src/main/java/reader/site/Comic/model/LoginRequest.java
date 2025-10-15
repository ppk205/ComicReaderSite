package reader.site.Comic.model;

import java.util.List;

public class LoginRequest {
    private String username;
    private String password;
    // Optional bookmarks payload sent by client during login
    private List<Bookmark> bookmarks;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public List<Bookmark> getBookmarks() { return bookmarks; }
    public void setBookmarks(List<Bookmark> bookmarks) { this.bookmarks = bookmarks; }
}
