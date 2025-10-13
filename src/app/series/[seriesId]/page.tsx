import Link from "next/link";

export default function SeriesDetailPage({ params }: { params: { seriesId: string } }) {
  // Dữ liệu mẫu cho các chapter
  const chapters = [
    { id: 1, title: "Chapter 1: Khởi đầu" },
    { id: 2, title: "Chapter 2: Cuộc phiêu lưu" },
    { id: 3, title: "Chapter 3: Đối đầu" },
  ];

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <h1>Danh sách Chapter của Series {params.seriesId}</h1>
      <ul>
        {chapters.map((chapter) => (
          <li key={chapter.id}>
            <Link href={`/series/${params.seriesId}/${chapter.id}`}>{chapter.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}