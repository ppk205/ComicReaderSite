package reader.site.Comic.model;

import java.sql.Timestamp;

public class Comment {
  public long id;
  public long postId;
  public String authorId;     // có thể null (guest)
  public String content;
  public Timestamp createdAt;
}
