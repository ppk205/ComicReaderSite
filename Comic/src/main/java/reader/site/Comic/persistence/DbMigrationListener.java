package reader.site.Comic.persistence;

import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import jakarta.servlet.annotation.WebListener;

@WebListener
public class DbMigrationListener implements ServletContextListener {

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        // Run migrations in a background thread to avoid delaying startup too long
        new Thread(() -> {
            try {
                DbMigrationService svc = new DbMigrationService();
                svc.applyPendingMigrations();
            } catch (Throwable t) {
                // log to console; container logs will capture it
                t.printStackTrace();
            }
        }, "db-migration-runner").start();
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        // nothing
    }
}
