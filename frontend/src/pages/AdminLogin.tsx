import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

export default function AdminLogin() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) {
      navigate("/admin");
    } else {
      setError("Invalid credentials");
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "11px 14px",
    backgroundColor: "var(--muted)",
    border: "1px solid var(--border)",
    borderRadius: 6,
    color: "var(--foreground)",
    fontSize: "0.9375rem",
    fontFamily: "var(--font-sans)",
    outline: "none",
    transition: "border-color 0.15s",
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      backgroundColor: "var(--background)",
      color: "var(--foreground)",
      fontFamily: "var(--font-sans)",
    }}>
      {/* Left panel - decorative */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 40,
        backgroundColor: "var(--muted)",
        borderRight: "1px solid var(--border)",
      }}
        className="hidden-mobile"
      >
        <Link to="/" style={{ textDecoration: "none", color: "var(--foreground)" }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 600 }}>
            <span style={{ letterSpacing: "0.35em", fontWeight: 400, textTransform: "uppercase", color: "var(--foreground)" }}>JVSV</span>
          </span>
        </Link>

        <div>
          <blockquote style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
            fontWeight: 400,
            lineHeight: 1.25,
            fontStyle: "italic",
            letterSpacing: "-0.02em",
            color: "var(--foreground)",
            maxWidth: 480,
          }}>
            "The best writing comes from people who have something to say and know how to say it — quietly, precisely, and without fuss."
          </blockquote>
          <div style={{ marginTop: 20, fontSize: "0.875rem", color: "var(--muted-fg)" }}>
            Jonathan Salgado Vega — Personal Blog
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          {["engineering", "design", "personal", "career"].map((tag) => (
            <span key={tag} style={{
              padding: "4px 10px",
              border: "1px solid var(--border)",
              borderRadius: 100,
              fontSize: "0.75rem",
              color: "var(--muted-fg)",
              fontFamily: "var(--font-mono)",
            }}>
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Right panel - login form */}
      <div style={{
        width: "min(480px, 100%)",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "48px 40px",
        position: "relative",
      }}>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          style={{
            position: "absolute",
            top: 24,
            right: 24,
            padding: 8,
            background: "var(--muted)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            color: "var(--muted-fg)",
            cursor: "pointer",
            display: "flex",
            transition: "color 0.15s",
          }}
        >
          {theme === "dark" ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>

        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", letterSpacing: "0.08em", color: "var(--accent)", textTransform: "uppercase", marginBottom: 12 }}>
            Admin Access
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 600, lineHeight: 1.2, margin: 0 }}>
            Welcome back
          </h1>
          <p style={{ color: "var(--muted-fg)", marginTop: 8, fontSize: "0.9375rem" }}>
            Sign in to manage your posts.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ ...inputStyle, paddingRight: 44 }}
                onFocus={e => (e.currentTarget.style.borderColor = "var(--accent)")}
                onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--muted-fg)",
                  cursor: "pointer",
                  padding: 4,
                  display: "flex",
                }}
              >
                <EyeIcon open={showPw} />
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              padding: "10px 14px",
              backgroundColor: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 6,
              color: "#EF4444",
              fontSize: "0.8125rem",
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4,
              padding: "12px 0",
              backgroundColor: "var(--accent)",
              color: "var(--accent-fg)",
              border: "none",
              borderRadius: 6,
              fontSize: "0.9375rem",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "var(--font-sans)",
              opacity: loading ? 0.7 : 1,
              transition: "opacity 0.15s",
            }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <Link to="/" style={{ display: "block", textAlign: "center", marginTop: 24, fontSize: "0.875rem", color: "var(--muted-fg)", textDecoration: "none" }}
          onMouseOver={e => (e.currentTarget.style.color = "var(--foreground)")}
          onMouseOut={e => (e.currentTarget.style.color = "var(--muted-fg)")}
        >
          ← Back to blog
        </Link>
      </div>
    </div>
  );
}
