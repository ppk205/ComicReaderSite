"use client";
import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("http://localhost:8080/Comic/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setMsg(data?.message || "Đăng nhập thất bại");
        return;
      }
      setMsg("✅ Đăng nhập thành công!");
      // window.location.href = "/dashboard";
    } catch {
      setMsg("❌ Không kết nối được máy chủ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#0d1117",
      color: "#e6edf3",
      fontFamily: "Inter, sans-serif"
    }}>
      <form
        onSubmit={onSubmit}
        style={{
          width: 360,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          backgroundColor: "#161b22",
          padding: "32px 28px",
          borderRadius: 12,
          boxShadow: "0 0 10px rgba(0,0,0,0.4)"
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: 10 }}>Đăng nhập</h1>

        <label>
          <span style={{ display: "block", marginBottom: 6 }}>Tên đăng nhập</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Nhập username"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #30363d",
              backgroundColor: "#0d1117",
              color: "#e6edf3",
            }}
          />
        </label>

        <label>
          <span style={{ display: "block", marginBottom: 6 }}>Mật khẩu</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Nhập password"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #30363d",
              backgroundColor: "#0d1117",
              color: "#e6edf3",
            }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 10,
            backgroundColor: "#238636",
            color: "#fff",
            border: "none",
            padding: "10px 12px",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600,
            transition: "0.2s",
          }}
          onMouseOver={(e) => ((e.target as HTMLButtonElement).style.backgroundColor = "#2ea043")}
          onMouseOut={(e) => ((e.target as HTMLButtonElement).style.backgroundColor = "#238636")}
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        {msg && (
          <p style={{
            textAlign: "center",
            color: msg.includes("✅") ? "#2ea043" : "#f85149",
            marginTop: 8
          }}>
            {msg}
          </p>
        )}
      </form>
    </div>
  );
}
