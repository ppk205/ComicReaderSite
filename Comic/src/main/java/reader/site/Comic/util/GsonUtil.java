package reader.site.Comic.util;

import com.google.gson.*;
import java.lang.reflect.Type;
import java.time.LocalDateTime;

/**
 * Tiện ích Gson xử lý LocalDateTime an toàn.
 */
public class GsonUtil {
    public static final Gson gson = new GsonBuilder()
            .registerTypeAdapter(LocalDateTime.class, new JsonSerializer<LocalDateTime>() {
                @Override
                public JsonElement serialize(LocalDateTime src, Type typeOfSrc, JsonSerializationContext context) {
                    return new JsonPrimitive(src.toString()); // Ví dụ: "2025-10-15T10:22:45"
                }
            })
            .registerTypeAdapter(LocalDateTime.class, new JsonDeserializer<LocalDateTime>() {
                @Override
                public LocalDateTime deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context)
                        throws JsonParseException {
                    return LocalDateTime.parse(json.getAsString());
                }
            })
            .setPrettyPrinting()
            .create();
}