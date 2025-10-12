package auth.business;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "User")
public class User implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false) // luu hash
    private String password;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public Long getUserId() { return userId; }
    public void setUserId(Long id) { this.userId = id; }
    public String getUsername() { return username; }
    public void setUsername(String u) { this.username = u; }
    public String getPassword() { return password; }
    public void setPassword(String p) { this.password = p; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime t) { this.createdAt = t; }
}