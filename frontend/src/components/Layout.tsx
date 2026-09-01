import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router";
import { useTheme } from "@/context/ThemeContext";

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  );
}

export default function Layout() {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/?q=${encodeURIComponent(searchValue.trim())}`);
      setSearchOpen(false);
      setSearchValue("");
    }
  };

  return (
    <div style={{ backgroundColor: "var(--background)", color: "var(--foreground)", minHeight: "100vh", fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          borderBottom: `1px solid ${scrolled ? "var(--border)" : "transparent"}`,
          backgroundColor: scrolled ? "var(--background)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          transition: "all 0.25s ease",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link to="/" style={{ textDecoration: "none", color: "var(--foreground)" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "1.375rem", fontWeight: 600, letterSpacing: "-0.02em" }}>
              <span style={{ letterSpacing: "0.35em", fontWeight: 400, textTransform: "uppercase", color: "var(--foreground)" }}>JVSV</span>
            </span>
          </Link>

          <nav style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link to="/" style={{ padding: "6px 14px", fontSize: "0.875rem", color: "var(--muted-fg)", textDecoration: "none", borderRadius: 4, transition: "color 0.15s" }}
              onMouseOver={e => (e.currentTarget.style.color = "var(--foreground)")}
              onMouseOut={e => (e.currentTarget.style.color = "var(--muted-fg)")}
            >
              Blog
            </Link>
            <Link to="/sobre-mi" style={{ padding: "6px 14px", fontSize: "0.875rem", color: "var(--muted-fg)", textDecoration: "none", borderRadius: 4, transition: "color 0.15s" }}
              onMouseOver={e => (e.currentTarget.style.color = "var(--foreground)")}
              onMouseOut={e => (e.currentTarget.style.color = "var(--muted-fg)")}
            >
              Sobre mí
            </Link>
            {/* <Link to="/admin" style={{ padding: "6px 14px", fontSize: "0.875rem", color: "var(--muted-fg)", textDecoration: "none", borderRadius: 4, transition: "color 0.15s" }}
              onMouseOver={e => (e.currentTarget.style.color = "var(--foreground)")}
              onMouseOut={e => (e.currentTarget.style.color = "var(--muted-fg)")}
            >
              Admin
            </Link> */}

            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} style={{ display: "flex", alignItems: "center" }}>
                <input
                  ref={searchRef}
                  value={searchValue}
                  onChange={e => setSearchValue(e.target.value)}
                  onBlur={() => { if (!searchValue) setSearchOpen(false); }}
                  placeholder="Search posts…"
                  style={{
                    background: "var(--muted)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                    padding: "6px 12px",
                    borderRadius: 4,
                    fontSize: "0.875rem",
                    outline: "none",
                    width: 200,
                    fontFamily: "var(--font-sans)",
                  }}
                />
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                style={{ padding: 8, background: "none", border: "none", color: "var(--muted-fg)", cursor: "pointer", borderRadius: 4, display: "flex", transition: "color 0.15s" }}
                onMouseOver={e => (e.currentTarget.style.color = "var(--foreground)")}
                onMouseOut={e => (e.currentTarget.style.color = "var(--muted-fg)")}
                aria-label="Open search"
              >
                <SearchIcon />
              </button>
            )}

            <button
              onClick={toggleTheme}
              style={{ padding: 8, background: "none", border: "none", color: "var(--muted-fg)", cursor: "pointer", borderRadius: 4, display: "flex", transition: "color 0.15s" }}
              onMouseOver={e => (e.currentTarget.style.color = "var(--foreground)")}
              onMouseOut={e => (e.currentTarget.style.color = "var(--muted-fg)")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer style={{ borderTop: "1px solid var(--border)", marginTop: 80, padding: "32px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.125rem", fontWeight: 600 }}>
            <span style={{ letterSpacing: "0.35em", fontWeight: 400, textTransform: "uppercase", color: "var(--foreground)" }}>JVSV</span>
          </span>
          <span style={{ fontSize: "0.8125rem", color: "var(--muted-fg)" }}>
            © 2026 Jonathan Salgado Vega — Writing about code, craft & quiet.
          </span>
        </div>
      </footer>
    </div>
  );
}
