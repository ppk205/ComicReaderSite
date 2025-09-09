package reader.site.Comic.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import reader.site.Comic.repository.MangaRepository;
import reader.site.Comic.repository.UserRepository;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private MangaRepository mangaRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Manga statistics
        long totalManga = mangaRepository.count();
        stats.put("totalManga", totalManga);
        
        // User statistics
        long totalUsers = userRepository.count();
        long totalAdmins = userRepository.countByRole("admin");
        long totalAuthors = userRepository.countByRole("author");
        long totalRegularUsers = userRepository.countByRole("user");
        
        stats.put("totalUsers", totalUsers);
        stats.put("totalAdmins", totalAdmins);
        stats.put("totalAuthors", totalAuthors);
        stats.put("totalRegularUsers", totalRegularUsers);
        
        return stats;
    }

    @GetMapping("/dashboard")
    public Map<String, Object> getDashboardData() {
        Map<String, Object> dashboard = new HashMap<>();
        
        // Get statistics
        dashboard.put("stats", getStats());
        
        // Recent users (last 10)
        dashboard.put("recentUsers", userRepository.findAll().stream()
                .sorted((u1, u2) -> u2.getCreatedAt().compareTo(u1.getCreatedAt()))
                .limit(10)
                .toList());
        
        // Recent manga (last 10)
        dashboard.put("recentManga", mangaRepository.findAll().stream()
                .limit(10)
                .toList());
        
        return dashboard;
    }
}
