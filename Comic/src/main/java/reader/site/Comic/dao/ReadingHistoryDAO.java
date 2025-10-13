package reader.site.Comic.dao;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import reader.site.Comic.model.ReadingHistory;

import java.io.*;
import java.lang.reflect.Type;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

public class ReadingHistoryDAO {
    private static final String DATA_FILE = "reading_history.json";
    private static final Gson gson = new Gson();
    private List<ReadingHistory> readingHistories;

    public ReadingHistoryDAO() {
        loadData();
    }

    private void loadData() {
        try {
            File file = new File(DATA_FILE);
            if (!file.exists()) {
                readingHistories = new ArrayList<>();
                saveData();
                return;
            }

            FileReader reader = new FileReader(file);
            Type listType = new TypeToken<List<ReadingHistory>>(){}.getType();
            readingHistories = gson.fromJson(reader, listType);
            reader.close();

            if (readingHistories == null) {
                readingHistories = new ArrayList<>();
            }
        } catch (Exception e) {
            e.printStackTrace();
            readingHistories = new ArrayList<>();
        }
    }

    private void saveData() {
        try {
            FileWriter writer = new FileWriter(DATA_FILE);
            gson.toJson(readingHistories, writer);
            writer.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    // Add or update reading progress
    public ReadingHistory updateReadingProgress(String userId, String comicId, String comicTitle,
                                               String comicCover, int chapter, int totalChapters) {
        ReadingHistory existing = findByUserAndComic(userId, comicId);

        if (existing != null) {
            existing.setLastChapter(chapter);
            existing.setTotalChapters(totalChapters);
            existing.setLastReadTime(LocalDateTime.now());

            // Check if completed
            if (chapter >= totalChapters && totalChapters > 0) {
                existing.setCompleted(true);
                existing.setStatus("completed");
            } else if (existing.getStatus().equals("plan_to_read")) {
                existing.setStatus("reading");
            }
        } else {
            existing = new ReadingHistory(userId, comicId, comicTitle, comicCover);
            existing.setId(generateId());
            existing.setLastChapter(chapter);
            existing.setTotalChapters(totalChapters);

            if (chapter >= totalChapters && totalChapters > 0) {
                existing.setCompleted(true);
                existing.setStatus("completed");
            } else {
                existing.setStatus("reading");
            }

            readingHistories.add(existing);
        }

        saveData();
        return existing;
    }

    // Get reading history for a user
    public List<ReadingHistory> getReadingHistoryByUser(String userId) {
        return readingHistories.stream()
                .filter(history -> history.getUserId().equals(userId))
                .sorted((h1, h2) -> h2.getLastReadTime().compareTo(h1.getLastReadTime()))
                .collect(Collectors.toList());
    }

    // Get reading history by status
    public List<ReadingHistory> getReadingHistoryByUserAndStatus(String userId, String status) {
        return readingHistories.stream()
                .filter(history -> history.getUserId().equals(userId) && history.getStatus().equals(status))
                .sorted((h1, h2) -> h2.getLastReadTime().compareTo(h1.getLastReadTime()))
                .collect(Collectors.toList());
    }

    // Get recently read comics (last 10)
    public List<ReadingHistory> getRecentlyRead(String userId, int limit) {
        return readingHistories.stream()
                .filter(history -> history.getUserId().equals(userId))
                .filter(history -> !"plan_to_read".equals(history.getStatus()))
                .sorted((h1, h2) -> h2.getLastReadTime().compareTo(h1.getLastReadTime()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    // Get completed comics
    public List<ReadingHistory> getCompletedComics(String userId) {
        return getReadingHistoryByUserAndStatus(userId, "completed");
    }

    // Get currently reading comics
    public List<ReadingHistory> getCurrentlyReading(String userId) {
        return getReadingHistoryByUserAndStatus(userId, "reading");
    }

    // Check if user has read a comic
    public boolean hasUserReadComic(String userId, String comicId) {
        return findByUserAndComic(userId, comicId) != null;
    }

    // Get reading progress for a specific comic
    public ReadingHistory getReadingProgress(String userId, String comicId) {
        return findByUserAndComic(userId, comicId);
    }

    // Update reading status (reading, completed, plan_to_read, dropped)
    public ReadingHistory updateReadingStatus(String userId, String comicId, String status) {
        ReadingHistory existing = findByUserAndComic(userId, comicId);
        if (existing != null) {
            existing.setStatus(status);
            if ("completed".equals(status)) {
                existing.setCompleted(true);
            }
            saveData();
        }
        return existing;
    }

    // Add to plan to read
    public ReadingHistory addToPlanToRead(String userId, String comicId, String comicTitle, String comicCover) {
        ReadingHistory existing = findByUserAndComic(userId, comicId);
        if (existing == null) {
            existing = new ReadingHistory(userId, comicId, comicTitle, comicCover);
            existing.setId(generateId());
            existing.setStatus("plan_to_read");
            readingHistories.add(existing);
            saveData();
        } else {
            existing.setStatus("plan_to_read");
            saveData();
        }
        return existing;
    }

    // Remove from reading history
    public boolean removeFromHistory(String userId, String comicId) {
        ReadingHistory existing = findByUserAndComic(userId, comicId);
        if (existing != null) {
            readingHistories.remove(existing);
            saveData();
            return true;
        }
        return false;
    }

    // Get reading statistics
    public Map<String, Integer> getReadingStats(String userId) {
        List<ReadingHistory> userHistory = getReadingHistoryByUser(userId);
        Map<String, Integer> stats = new HashMap<>();

        stats.put("total", userHistory.size());
        stats.put("completed", (int) userHistory.stream().filter(h -> "completed".equals(h.getStatus())).count());
        stats.put("reading", (int) userHistory.stream().filter(h -> "reading".equals(h.getStatus())).count());
        stats.put("planToRead", (int) userHistory.stream().filter(h -> "plan_to_read".equals(h.getStatus())).count());
        stats.put("dropped", (int) userHistory.stream().filter(h -> "dropped".equals(h.getStatus())).count());

        return stats;
    }

    // Helper methods
    private ReadingHistory findByUserAndComic(String userId, String comicId) {
        return readingHistories.stream()
                .filter(history -> history.getUserId().equals(userId) && history.getComicId().equals(comicId))
                .findFirst()
                .orElse(null);
    }

    private String generateId() {
        return "rh_" + System.currentTimeMillis() + "_" + (int)(Math.random() * 1000);
    }

    // Get all reading histories (for admin)
    public List<ReadingHistory> getAllReadingHistories() {
        return new ArrayList<>(readingHistories);
    }
}

