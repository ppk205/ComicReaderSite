import Link from "next/link";

export default function SeriesPage() {
  // Dữ liệu mẫu cho các series
  const seriesList = [
    { id: 1, title: "One Piece", description: "Hải tặc phiêu lưu" },
    { id: 2, title: "Naruto", description: "Ninja huyền thoại" },
    { id: 3, title: "Dragon Ball", description: "Bảy viên ngọc rồng" },
  ];

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <h1>Danh sách Series</h1>
      <ul>
        {seriesList.map((series) => (
          <li key={series.id} style={{ marginBottom: 16 }}>
            <h2>
              <Link href={`/series/${series.id}`}>{series.title}</Link>
            </h2>
            <p>{series.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
