package reader.site.Comic.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import reader.site.Comic.model.Manga;
import reader.site.Comic.repository.MangaRepository;
import java.util.List;

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

    @PostMapping
    public Manga addManga(@RequestBody Manga manga) {
        return mangaRepository.save(manga);
    }
}
