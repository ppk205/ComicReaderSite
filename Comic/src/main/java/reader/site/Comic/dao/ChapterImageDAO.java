package reader.site.Comic.dao;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import reader.site.Comic.entity.ChapterImageEntity;
import reader.site.Comic.model.ChapterImage;
import reader.site.Comic.persistence.JPAUtil;

import java.util.List;
import java.util.stream.Collectors;

public class ChapterImageDAO {

    public List<ChapterImage> findByMangaAndChapter(String mangaId, String chapterName) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            // Truy vấn JPA thay cho SQL thủ công
            TypedQuery<ChapterImageEntity> query = em.createQuery(
                    "SELECT c FROM ChapterImageEntity c WHERE c.mangaId = :mangaId AND c.chapterName = :chapterName ORDER BY c.imageOrder ASC",
                    ChapterImageEntity.class
            );
            query.setParameter("mangaId", Long.parseLong(mangaId));
            query.setParameter("chapterName", chapterName);

            List<ChapterImageEntity> entities = query.getResultList();

            // Map sang model
            return entities.stream()
                    .map(this::toModel)
                    .collect(Collectors.toList());
        } finally {
            em.close();
        }
    }

    private ChapterImage toModel(ChapterImageEntity entity) {
        ChapterImage model = new ChapterImage();
        model.setUrl(entity.getImageUrl());
        model.setOrder(entity.getImageOrder());
        return model;
    }
}
