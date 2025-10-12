# Backend Migration Note

To follow best practices, toàn bộ mã nguồn backend (Java, Jakarta EE, JPA, Maven, cấu hình, Dockerfile, v.v.) sẽ được chuyển vào folder `Comic/`.

## Hướng dẫn chuyển backend vào folder `Comic/`

### 1. **Cấu trúc chuẩn sau khi chuyển**
```
Comic/
├── pom.xml
├── dockerfile
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/comicreader/
│   │   │       ├── config/
│   │   │       ├── entity/
│   │   │       ├── repository/
│   │   │       ├── service/
│   │   │       ├── servlet/
│   │   │       └── security/
│   │   ├── resources/
│   │   │   └── META-INF/
│   │   │       └── persistence.xml
│   │   └── webapp/
│   │       └── WEB-INF/
│   │           └── web.xml
│   └── test/
│       └── java/
│           └── ...
├── target/
│   └── Comic.war
└── ...
```

### 2. **Các file cần chuyển**
- Tất cả các file Java backend (config, entity, repository, service, servlet, security) vào `Comic/src/main/java/com/comicreader/`
- File cấu hình JPA: `persistence.xml` vào `Comic/src/main/resources/META-INF/`
- File cấu hình web: `web.xml` vào `Comic/src/main/webapp/WEB-INF/`
- File Dockerfile backend vào `Comic/dockerfile`
- File Maven: `Comic/pom.xml`

### 3. **Các bước thực hiện**
1. Di chuyển toàn bộ mã nguồn backend vào folder `Comic/` theo cấu trúc trên
2. Đảm bảo các import và package path đúng chuẩn
3. Kiểm tra lại cấu hình Maven, JPA, Docker
4. Build lại project bằng Maven trong folder `Comic/`
5. Deploy backend từ folder `Comic/`

### 4. **Frontend giữ nguyên**
- Frontend Next.js, React, TypeScript vẫn nằm trong folder `ComicReaderSite/`

---

**Sau khi chuyển, backend sẽ nằm hoàn toàn trong folder `Comic/` và frontend trong `ComicReaderSite/`.**

Nếu bạn cần script tự động di chuyển hoặc cập nhật lại các package path, hãy yêu cầu cụ thể nhé.