package reader.site.Comic.util;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public class Json {
  public static final Gson gson =
      new GsonBuilder().setDateFormat("yyyy-MM-dd'T'HH:mm:ssX").create();
}
