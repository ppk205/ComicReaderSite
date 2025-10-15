package reader.site.Comic.model;

/**
 * Payload for user registration.
 */
public class RegisterRequest {
    private String username;
    private String email;
    private String password;
    // optional role name/id can be added, but default role will be 'role-user'
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
}