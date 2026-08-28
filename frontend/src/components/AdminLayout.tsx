import { useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { usePosts } from "@/context/PostsContext";

function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

const navItems = [
  { to: "/admin", label: "Dashboard", icon: <HomeIcon />, end: true },
  { to: "/admin/posts", label: "All Posts", icon: <FileIcon />, end: false },
  { to: "/admin/posts/new", label: "New Post", icon: <PlusIcon />, end: true },
  { to: "/admin/settings", label: "Configuración", icon: <GearIcon />, end: false },
];

export default function AdminLayout() {
  const { isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { posts } = usePosts();

  useEffect(() => {
    if (!isAuthenticated) navigate("/admin/login", { replace: true });
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  const published = posts.filter((p) => p.status === "published").length;
  const drafts = posts.filter((p) => p.status === "draft").length;

  const navLinkStyle = (isActive: boolean) => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 14px",
    borderRadius: 6,
    fontSize: "0.875rem",
    fontWeight: isActive ? 500 : 400,
    color: isActive ? "var(--accent-fg)" : "var(--muted-fg)",
    backgroundColor: isActive ? "var(--accent)" : "transparent",
    textDecoration: "none",
    transition: "all 0.15s",
    cursor: "pointer",
  });

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "var(--background)", color: "var(--foreground)", fontFamily: "var(--font-sans)" }}>
      {/* Sidebar */}
      <aside style={{
        width: 220,
        flexShrink: 0,
        backgroundColor: "var(--sidebar)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: "20px 12px",
        gap: 4,
      }}>
        <div style={{ padding: "4px 14px 20px", borderBottom: "1px solid var(--border)", marginBottom: 8 }}>
          <Link to="/" style={{ textDecoration: "none", color: "var(--foreground)" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 600 }}>
              <span style={{ letterSpacing: "0.35em", fontWeight: 400, textTransform: "uppercase", color: "var(--foreground)" }}>JHVS</span>
            </span>
          </Link>
          <div style={{ fontSize: "0.7rem", color: "var(--muted-fg)", marginTop: 4, fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>
            ADMIN PANEL
          </div>
        </div>

        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            style={({ isActive }) => navLinkStyle(isActive)}
            onMouseOver={(e) => {
              const el = e.currentTarget as HTMLElement;
              if (!el.style.backgroundColor.includes("accent")) {
                el.style.color = "var(--foreground)";
                el.style.backgroundColor = "var(--muted)";
              }
            }}
            onMouseOut={(e) => {
              const el = e.currentTarget as HTMLElement;
              if (!el.style.backgroundColor.includes("accent")) {
                el.style.color = "var(--muted-fg)";
                el.style.backgroundColor = "transparent";
              }
            }}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}

        <div style={{ marginTop: 16, padding: "12px 14px", backgroundColor: "var(--muted)", borderRadius: 6, fontSize: "0.8rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, color: "var(--muted-fg)" }}>
            <span>Published</span>
            <span style={{ color: "var(--accent)", fontWeight: 600 }}>{published}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted-fg)" }}>
            <span>Drafts</span>
            <span style={{ fontWeight: 600, color: "var(--foreground)" }}>{drafts}</span>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: "flex", gap: 8, padding: "0 2px" }}>
          <button
            onClick={toggleTheme}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px", background: "var(--muted)", border: "none", color: "var(--muted-fg)", cursor: "pointer", borderRadius: 6, fontSize: "0.8rem", transition: "all 0.15s" }}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            onClick={() => { logout(); navigate("/admin/login"); }}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px", background: "var(--muted)", border: "none", color: "var(--muted-fg)", cursor: "pointer", borderRadius: 6, fontSize: "0.8rem", transition: "all 0.15s" }}
          >
            <LogoutIcon />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
        <Outlet />
      </main>
    </div>
  );
}
