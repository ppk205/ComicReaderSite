package reader.site.Comic.model;

import java.util.List;
import java.util.Map;

public class User {
    private String id;
    private String username;
    private String email;
    private String password;
    private String avatarUrl;
    private String role;
    private int seriesCount;
    private int followersCount;
    private String bio;
    private String preferences;
    private String displayName;
    private String birthDate;
    private int viewerCount;
    private List<String> mangaLikes;
    private List<String> authorLikes;
    private Map<String, String> socialLinks;
    private Map<String, Object> quickNote;

    // Default constructor
    public User() {
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public int getSeriesCount() {
        return seriesCount;
    }

    public void setSeriesCount(int seriesCount) {
        this.seriesCount = seriesCount;
    }

    public int getFollowersCount() {
        return followersCount;
    }

    public void setFollowersCount(int followersCount) {
        this.followersCount = followersCount;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getPreferences() {
        return preferences;
    }

    public void setPreferences(String preferences) {
        this.preferences = preferences;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(String birthDate) {
        this.birthDate = birthDate;
    }

    public int getViewerCount() {
        return viewerCount;
    }

    public void setViewerCount(int viewerCount) {
        this.viewerCount = viewerCount;
    }

    public List<String> getMangaLikes() {
        return mangaLikes;
    }

    public void setMangaLikes(List<String> mangaLikes) {
        this.mangaLikes = mangaLikes;
    }

    public List<String> getAuthorLikes() {
        return authorLikes;
    }

    public void setAuthorLikes(List<String> authorLikes) {
        this.authorLikes = authorLikes;
    }

    public Map<String, String> getSocialLinks() {
        return socialLinks;
    }

    public void setSocialLinks(Map<String, String> socialLinks) {
        this.socialLinks = socialLinks;
    }

    public Map<String, Object> getQuickNote() {
        return quickNote;
    }

    public void setQuickNote(Map<String, Object> quickNote) {
        this.quickNote = quickNote;
    }
}
