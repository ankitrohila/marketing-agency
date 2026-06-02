"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed. Please check your credentials.");
        setLoading(false);
        return;
      }

      localStorage.setItem("bt_admin_token", data.token);
      localStorage.setItem("bt_admin_user", JSON.stringify(data.user));
      router.push("/admin/dashboard");
    } catch {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: 40, textAlign: "center" }}>
        <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "#E8312A", letterSpacing: "-0.04em", marginBottom: 6 }}>
          BrandThink
        </div>
        <div style={{ fontSize: "0.8125rem", color: "var(--adm-muted)" }}>Admin Portal</div>
      </div>

      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--adm-card)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 20,
          padding: "36px 32px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
        }}
      >
        <h1 style={{ fontSize: "1.375rem", fontWeight: 800, color: "var(--adm-text)", marginBottom: 8, letterSpacing: "-0.03em" }}>
          Sign in to your account
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--adm-muted)", marginBottom: 32 }}>
          Manage your content, SEO, and site settings.
        </p>

        {error && (
          <div
            style={{
              padding: "12px 16px",
              background: "rgba(232,49,42,0.1)",
              border: "1px solid rgba(232,49,42,0.3)",
              borderRadius: 10,
              color: "#FF6B5B",
              fontSize: "0.875rem",
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--adm-muted2)", marginBottom: 8 }}>
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@thebrandthink.com"
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "var(--adm-card2)",
                border: "1px solid var(--adm-border2)",
                borderRadius: 10,
                color: "var(--adm-text)",
                fontSize: "0.9375rem",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(232,49,42,0.5)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--adm-muted2)", marginBottom: 8 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "var(--adm-card2)",
                border: "1px solid var(--adm-border2)",
                borderRadius: 10,
                color: "var(--adm-text)",
                fontSize: "0.9375rem",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(232,49,42,0.5)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px 20px",
              background: loading ? "#444" : "linear-gradient(135deg, #E8312A 0%, #FF6B1A 100%)",
              border: "none",
              borderRadius: 10,
              color: "#fff",
              fontSize: "0.9375rem",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Demo creds */}
        <div
          style={{
            marginTop: 28,
            padding: "16px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid var(--adm-border)",
            borderRadius: 10,
          }}
        >
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--adm-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
            Demo Credentials
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { role: "Super Admin", email: "admin@thebrandthink.com", password: "admin123" },
              { role: "Editor", email: "priya@thebrandthink.com", password: "editor123" },
              { role: "Author", email: "rohit@thebrandthink.com", password: "author123" },
            ].map((cred) => (
              <button
                key={cred.role}
                onClick={() => { setEmail(cred.email); setPassword(cred.password); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 10px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--adm-border)",
                  borderRadius: 6,
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)")}
              >
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--adm-muted2)" }}>{cred.role}</span>
                <span style={{ fontSize: "0.6875rem", color: "var(--adm-muted)" }}>{cred.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24, fontSize: "0.8125rem", color: "var(--adm-muted)" }}>
        <Link href="/" style={{ color: "var(--adm-muted)", textDecoration: "none" }}>
          ← Back to BrandThink
        </Link>
      </div>
    </div>
  );
}
