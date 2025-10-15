package reader.site.Comic.entity;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "db_migration")
public class DbMigrationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "script_name", nullable = false, unique = true)
    private String scriptName;

    @Column(name = "applied_at", nullable = false)
    private Instant appliedAt;

    public DbMigrationEntity() {
    }

    public DbMigrationEntity(String scriptName, Instant appliedAt) {
        this.scriptName = scriptName;
        this.appliedAt = appliedAt;
    }

    public Long getId() {
        return id;
    }

    public String getScriptName() {
        return scriptName;
    }

    public void setScriptName(String scriptName) {
        this.scriptName = scriptName;
    }

    public Instant getAppliedAt() {
        return appliedAt;
    }

    public void setAppliedAt(Instant appliedAt) {
        this.appliedAt = appliedAt;
    }
}
