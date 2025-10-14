package reader.site.Comic.model;

import java.sql.Timestamp;

public class Post {
  public long id;
  public String authorId;     // có thể null (guest)
  public int mangaId;
  public String title;
  public String content;
  public String coverImage;
  public String tags;         // lưu dạng CSV
  public Timestamp createdAt;
  public Timestamp updatedAt;
}
