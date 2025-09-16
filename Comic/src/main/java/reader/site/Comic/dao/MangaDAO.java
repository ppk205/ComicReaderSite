package reader.site.Comic.dao;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.bson.types.ObjectId;
import reader.site.Comic.model.Manga;

import java.util.ArrayList;
import java.util.List;

public class MangaDAO {
    private static final String CONNECTION_STRING =
            "mongodb+srv://23162037_db_user:PbL4JP0UUV7tygFp@comic.ytiwgxu.mongodb.net/Comic?retryWrites=true&w=majority&appName=Comic"; //=))) đừng có public repo giúp t

    private static final String DATABASE_NAME = "Comic";
    private static final String COLLECTION_NAME = "manga";

    private final MongoClient mongoClient;
    private final MongoDatabase database;
    private final MongoCollection<Document> collection;

    public MangaDAO() {
        // connect to MongoDB Atlas
        mongoClient = MongoClients.create(CONNECTION_STRING);
        database = mongoClient.getDatabase(DATABASE_NAME);
        collection = database.getCollection(COLLECTION_NAME);
    }

    // CREATE
    public Manga insert(Manga manga) {
        Document doc = new Document("_id", new ObjectId())
                .append("title", manga.getTitle())
                .append("cover", manga.getCover())
                .append("chapters", manga.getChapters());

        collection.insertOne(doc);

        manga.setId(doc.getObjectId("_id").toHexString());
        return manga;
    }

    // READ ALL
    public List<Manga> findAll() {
        List<Manga> mangas = new ArrayList<>();
        for (Document doc : collection.find()) {
            mangas.add(fromDocument(doc));
        }
        return mangas;
    }

    // READ ONE
    public Manga findById(String id) {
        Document doc = collection.find(new Document("_id", new ObjectId(id))).first();
        return doc != null ? fromDocument(doc) : null;
    }

    // UPDATE
    public boolean update(String id, Manga manga) {
        Document filter = new Document("_id", new ObjectId(id));
        Document update = new Document("$set",
                new Document("title", manga.getTitle())
                        .append("cover", manga.getCover())
                        .append("chapters", manga.getChapters()));

        return collection.updateOne(filter, update).getModifiedCount() > 0;
    }

    // DELETE
    public boolean delete(String id) {
        return collection.deleteOne(new Document("_id", new ObjectId(id))).getDeletedCount() > 0;
    }

    // Helper: convert Mongo Document -> Manga object
    private Manga fromDocument(Document doc) {
        Manga manga = new Manga();
        manga.setId(doc.getObjectId("_id").toHexString());
        manga.setTitle(doc.getString("title"));
        manga.setCover(doc.getString("cover"));
        manga.setChapters((List<String>) doc.get("chapters"));
        return manga;
    }
}
