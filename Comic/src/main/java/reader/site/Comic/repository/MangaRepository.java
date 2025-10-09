package reader.site.Comic.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import reader.site.Comic.model.Manga;

public interface MangaRepository extends MongoRepository<Manga, String> {
}
