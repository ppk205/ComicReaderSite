export default function ChapterReaderPage({ params }: { params: { seriesId: string, chapterId: string } }) {
  // Dữ liệu mẫu cho nội dung truyện
  const images = [
    "/sample1.jpg",
    "/sample2.jpg",
    "/sample3.jpg",
  ];

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <h1>Đọc truyện - Series {params.seriesId} - Chapter {params.chapterId}</h1>
      <div>
        {images.map((src, idx) => (
          <img key={idx} src={src} alt={`Trang ${idx + 1}`} style={{ width: "100%", marginBottom: 16 }} />
        ))}
      </div>
    </div>
  );
}