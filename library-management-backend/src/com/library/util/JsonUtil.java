package com.library.util;

import com.google.gson.*;

import java.lang.reflect.Type;
import java.sql.Date;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;

/**
 * Utility class for JSON serialization and deserialization using Google Gson.
 * Configured with custom TypeAdapters for java.sql.Date and java.sql.Timestamp.
 */
public class JsonUtil {

    private static final String DATE_FORMAT = "yyyy-MM-dd";
    private static final String TIMESTAMP_FORMAT = "yyyy-MM-dd HH:mm:ss";

    private static final Gson GSON = new GsonBuilder()
            .setDateFormat(TIMESTAMP_FORMAT)
            .registerTypeAdapter(Date.class, new JsonSerializer<Date>() {
                @Override
                public JsonElement serialize(Date src, Type typeOfSrc, JsonSerializationContext context) {
                    return new JsonPrimitive(new SimpleDateFormat(DATE_FORMAT).format(src));
                }
            })
            .registerTypeAdapter(Date.class, new JsonDeserializer<Date>() {
                @Override
                public Date deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context) throws JsonParseException {
                    try {
                        String dateStr = json.getAsString();
                        if (dateStr == null || dateStr.trim().isEmpty()) {
                            return null;
                        }
                        java.util.Date parsed = new SimpleDateFormat(DATE_FORMAT).parse(dateStr);
                        return new Date(parsed.getTime());
                    } catch (ParseException e) {
                        throw new JsonParseException("Failed parsing Date: " + json.getAsString(), e);
                    }
                }
            })
            .registerTypeAdapter(Timestamp.class, new JsonSerializer<Timestamp>() {
                @Override
                public JsonElement serialize(Timestamp src, Type typeOfSrc, JsonSerializationContext context) {
                    return new JsonPrimitive(new SimpleDateFormat(TIMESTAMP_FORMAT).format(src));
                }
            })
            .registerTypeAdapter(Timestamp.class, new JsonDeserializer<Timestamp>() {
                @Override
                public Timestamp deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context) throws JsonParseException {
                    try {
                        String timeStr = json.getAsString();
                        if (timeStr == null || timeStr.trim().isEmpty()) {
                            return null;
                        }
                        // Support ISO or standard timestamp format
                        if (timeStr.contains("T")) {
                            timeStr = timeStr.replace("T", " ");
                            if (timeStr.contains(".")) {
                                timeStr = timeStr.substring(0, timeStr.indexOf("."));
                            }
                        }
                        java.util.Date parsed = new SimpleDateFormat(TIMESTAMP_FORMAT).parse(timeStr);
                        return new Timestamp(parsed.getTime());
                    } catch (ParseException e) {
                        try {
                            java.util.Date parsed = new SimpleDateFormat(DATE_FORMAT).parse(json.getAsString());
                            return new Timestamp(parsed.getTime());
                        } catch (ParseException e2) {
                            throw new JsonParseException("Failed parsing Timestamp: " + json.getAsString(), e);
                        }
                    }
                }
            })
            .serializeNulls()
            .setPrettyPrinting()
            .create();

    public static Gson getGson() {
        return GSON;
    }

    public static String toJson(Object obj) {
        return GSON.toJson(obj);
    }

    public static <T> T fromJson(String json, Class<T> clazz) {
        return GSON.fromJson(json, clazz);
    }

    public static <T> T fromJson(String json, Type typeOfT) {
        return GSON.fromJson(json, typeOfT);
    }
}
