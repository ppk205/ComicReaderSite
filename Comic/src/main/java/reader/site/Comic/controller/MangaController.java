package reader.site.Comic.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reader.site.Comic.model.Manga;
import reader.site.Comic.repository.MangaRepository;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/manga")
@CrossOrigin(origins = "*")
public class MangaController {

    @Autowired
    private MangaRepository mangaRepository;

    @GetMapping
    public List<Manga> getAll() {
        return mangaRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Manga> getMangaById(@PathVariable String id) {
        Optional<Manga> manga = mangaRepository.findById(id);
        return manga.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Manga addManga(@RequestBody Manga manga) {
        return mangaRepository.save(manga);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Manga> updateManga(@PathVariable String id, @RequestBody Manga mangaDetails) {
        Optional<Manga> optionalManga = mangaRepository.findById(id);
        if (optionalManga.isPresent()) {
            Manga manga = optionalManga.get();
            manga.setTitle(mangaDetails.getTitle());
            manga.setCover(mangaDetails.getCover());
            manga.setChapters(mangaDetails.getChapters());
            return ResponseEntity.ok(mangaRepository.save(manga));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteManga(@PathVariable String id) {
        return mangaRepository.findById(id)
                .map(manga -> {
                    mangaRepository.delete(manga);
                    return ResponseEntity.ok().build();
                }).orElse(ResponseEntity.notFound().build());
    }
}
