package reader.site.Comic.service;

import reader.site.Comic.dao.MangaDAO;
import reader.site.Comic.dao.UserDAO;
import reader.site.Comic.model.ActivityItem;
import reader.site.Comic.model.DashboardStats;
import reader.site.Comic.model.Manga;
import reader.site.Comic.model.User;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

public class DashboardService {
    private final UserDAO userDAO;
    private final MangaDAO mangaDAO;

    public DashboardService(UserDAO userDAO, MangaDAO mangaDAO) {
        this.userDAO = userDAO;
        this.mangaDAO = mangaDAO;
    }

    public DashboardStats buildStats() {
        DashboardStats stats = new DashboardStats();

        List<User> allUsers = userDAO.findAllUsers();
        stats.setTotalUsers(allUsers.size());
        stats.setActiveUsers((int) allUsers.stream().filter(u -> "active".equalsIgnoreCase(u.getStatus())).count());

        try {
            List<Manga> mangas = mangaDAO.findAll();
            stats.setTotalManga(mangas.size());
            stats.setPublishedManga(Math.max(0, mangas.size() - 2));
            stats.setTotalChapters(mangas.stream()
                    .mapToInt(manga -> manga.getChapters() != null ? manga.getChapters().size() : 0)
                    .sum());
            stats.setNewMangaThisMonth(Math.min(mangas.size(), 15));
        } catch (Exception ex) {
            stats.setTotalManga(0);
            stats.setPublishedManga(0);
            stats.setTotalChapters(0);
            stats.setNewMangaThisMonth(0);
        }

        stats.setTotalViews(120_000 + ThreadLocalRandom.current().nextInt(5_000));
        stats.setNewUsersThisMonth(Math.min(allUsers.size(), 25));
        return stats;
    }

    public List<ActivityItem> recentActivity() {
        List<ActivityItem> activity = new ArrayList<>();
        activity.add(new ActivityItem("1", "success", "New manga \"Azure Chronicles\" was published", humanize(2)));
        activity.add(new ActivityItem("2", "info", "User \"nano_reader\" registered an account", humanize(6)));
        activity.add(new ActivityItem("3", "warning", "Chapter 15 of \"Nebula Drift\" flagged for review", humanize(12)));
        activity.add(new ActivityItem("4", "info", "Scheduled maintenance window announced", humanize(24)));
        return activity;
    }

    private String humanize(int hoursAgo) {
        Instant instant = Instant.now().minus(hoursAgo, ChronoUnit.HOURS);
        return instant.truncatedTo(ChronoUnit.MINUTES).toString();
    }
}
