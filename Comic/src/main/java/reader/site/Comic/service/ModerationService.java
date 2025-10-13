package reader.site.Comic.service;

import reader.site.Comic.model.ModerationReport;
import reader.site.Comic.model.ModerationSubmission;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

public class ModerationService {
    private final List<ModerationReport> reports = new CopyOnWriteArrayList<>();
    private final List<ModerationSubmission> submissions = new CopyOnWriteArrayList<>();

    public ModerationService() {
        seed();
    }

    private void seed() {
        if (!reports.isEmpty() || !submissions.isEmpty()) {
            return;
        }

        reports.add(new ModerationReport(
                "rep-001",
                "reader_92",
                "Incorrect chapter order",
                "Mystic Chronicles — Chapter 14",
                "open",
                iso(Instant.now().minus(20, ChronoUnit.HOURS))
        ));
        reports.add(new ModerationReport(
                "rep-002",
                "otakuFan",
                "Offensive language in comments",
                "City of Golems — Discussion Thread",
                "in_review",
                iso(Instant.now().minus(2, ChronoUnit.DAYS))
        ));
        reports.add(new ModerationReport(
                "rep-003",
                "alice.w",
                "Suspected duplicate upload",
                "Dragon Academy — Chapter 03",
                "resolved",
                iso(Instant.now().minus(4, ChronoUnit.DAYS))
        ));

        submissions.add(new ModerationSubmission(
                "sub-101",
                "Blade of Dawn",
                "studio-hikari",
                2,
                iso(Instant.now().minus(18, ChronoUnit.HOURS)),
                "pending"
        ));
        submissions.add(new ModerationSubmission(
                "sub-102",
                "Galactic Postman",
                "indie-sensei",
                1,
                iso(Instant.now().minus(42, ChronoUnit.HOURS)),
                "changes_requested"
        ));
        submissions.add(new ModerationSubmission(
                "sub-103",
                "Wings of Clay",
                "manga-vault",
                3,
                iso(Instant.now().minus(3, ChronoUnit.DAYS)),
                "pending"
        ));
    }

    public List<ModerationReport> fetchReports() {
        return new ArrayList<>(reports);
    }

    public List<ModerationSubmission> fetchSubmissions() {
        return new ArrayList<>(submissions);
    }

    public ModerationSubmission updateSubmissionStatus(String id, String status) {
        return submissions.stream()
                .filter(submission -> submission.getId().equals(id))
                .findFirst()
                .map(submission -> {
                    submission.setStatus(status);
                    return submission;
                })
                .orElse(null);
    }

    private String iso(Instant instant) {
        return instant.truncatedTo(ChronoUnit.SECONDS).toString();
    }
}
