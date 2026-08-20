package reader.site.Comic.util;

import jakarta.mail.*;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import java.util.Properties;

/**
 * Email helper. SMTP credentials come from environment variables
 * (SMTP_USERNAME / SMTP_APP_PASSWORD) — never hardcode secrets here.
 */
public class EmailUtil {

    // ✅ Cấu hình Gmail SMTP
    private static final String SMTP_HOST = "smtp.gmail.com";
    private static final int SMTP_PORT = 587;

    // ✅ Hàm gửi mail cơ bản
    public static void sendEmail(String to, String subject, String content) {
        // Read credentials lazily so the class can load even before env is configured.
        final String username = EnvConfig.smtpUsername();
        final String password = EnvConfig.smtpPassword();

        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true"); // ✅ bật STARTTLS
        props.put("mail.smtp.host", SMTP_HOST);
        props.put("mail.smtp.port", SMTP_PORT);
        props.put("mail.smtp.ssl.trust", SMTP_HOST);

        Session session = Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(username, password);
            }
        });

        try {
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(username));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(to));
            message.setSubject(subject);
            message.setText(content);

            Transport.send(message);
            System.out.println("✅ Email sent successfully to " + to);
        } catch (MessagingException e) {
            // [SECURITY] Log the failure without leaking credentials or message content.
            System.err.println("❌ Failed to send email: " + e.getMessage());
        }
    }

    public static void sendActivationEmail(String to, String token) {
        String link = EnvConfig.backendBaseUrl() + "/auth/activate?token=" + token;
        String subject = "Activate Your Comic Reader Account";
        String body = String.format(
                "Hello!\n\nPlease click the following link to activate your account:\n%s\n\n"
                        + "If you didn’t request this, please ignore this email.\n\nBest regards,\nComic Reader Team",
                link
        );
        sendEmail(to, subject, body);
    }

    public static void sendResetPasswordEmail(String to, String token) {
        String link = EnvConfig.appBaseUrl() + "/reset-password?token=" + token;
        String subject = "Reset Your Comic Password";
        String body = String.format(
                "Hello!\n\nPlease click the following link to reset your password:\n%s\n\n"
                        + "If you didn’t request this, please ignore this email.\n\nBest regards,\nComic Reader Team",
                link
        );
        sendEmail(to, subject, body);
    }
}
