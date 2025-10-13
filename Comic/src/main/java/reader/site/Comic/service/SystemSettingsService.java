package reader.site.Comic.service;

import reader.site.Comic.model.SystemSettings;

import java.util.Arrays;
import java.util.concurrent.atomic.AtomicReference;

public class SystemSettingsService {
    private final AtomicReference<SystemSettings> settingsRef = new AtomicReference<>();

    public SystemSettingsService() {
        SystemSettings defaults = new SystemSettings();
        defaults.setSiteName("Comic Reader Site");
        defaults.setSiteDescription("The best place to read manga online");
        defaults.setAllowRegistration(true);
        defaults.setMaxFileSize(10);
        defaults.setAllowedFileTypes(Arrays.asList("jpg", "jpeg", "png", "webp"));
        defaults.setMaintenanceMode(false);
        defaults.setEmailNotifications(true);
        settingsRef.set(defaults);
    }

    public SystemSettings getSettings() {
        return settingsRef.get();
    }

    public SystemSettings updateSettings(SystemSettings updated) {
        SystemSettings current = settingsRef.get();
        if (updated.getSiteName() != null) {
            current.setSiteName(updated.getSiteName());
        }
        if (updated.getSiteDescription() != null) {
            current.setSiteDescription(updated.getSiteDescription());
        }
        current.setAllowRegistration(updated.isAllowRegistration());
        current.setMaintenanceMode(updated.isMaintenanceMode());
        current.setEmailNotifications(updated.isEmailNotifications());
        if (updated.getMaxFileSize() > 0) {
            current.setMaxFileSize(updated.getMaxFileSize());
        }
        if (updated.getAllowedFileTypes() != null && !updated.getAllowedFileTypes().isEmpty()) {
            current.setAllowedFileTypes(updated.getAllowedFileTypes());
        }
        settingsRef.set(current);
        return current;
    }
}
