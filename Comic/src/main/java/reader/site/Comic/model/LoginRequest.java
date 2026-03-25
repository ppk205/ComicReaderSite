package reader.site.Comic.model;

/**
 * LoginRequest now expects an email and password.
 * Kept minimal: only email + password are used by the backend login flow.
 * (Clients may still send "username" if needed, but the canonical field is "email".)
 */
public class LoginRequest {
    private String email;
    private String password;

    public LoginRequest() {}

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
