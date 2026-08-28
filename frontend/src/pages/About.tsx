import { useAbout } from "@/context/AboutContext";

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
    </svg>
  );
}

export default function About() {
  const { about, loading } = useAbout();

  if (loading || !about) return null;

  const [firstName, ...restName] = about.name.split(" ");
  const bioParagraphs = about.bio.split("\n\n");

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "clamp(40px, 6vw, 72px) 24px 80px" }}>

      {/* Header */}
      <div style={{ marginBottom: 56 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 14 }}>
          Sobre mí
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 36, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
              margin: "0 0 20px",
            }}>
              {firstName}<br />{restName.join(" ")}
            </h1>
            <p style={{ fontSize: "1.0625rem", color: "var(--muted-fg)", lineHeight: 1.8, margin: "0 0 20px" }}>
              {about.headline}
            </p>
            {bioParagraphs.map((paragraph, i) => (
              <p key={i} style={{ fontSize: "1.0625rem", color: "var(--muted-fg)", lineHeight: 1.8, margin: i < bioParagraphs.length - 1 ? "0 0 20px" : 0 }}>
                {paragraph}
              </p>
            ))}
          </div>

          {/* Avatar card */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            padding: "28px 32px",
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            flexShrink: 0,
          }}>
            <img
              src={about.avatarImage}
              alt={about.name}
              style={{ width: 110, height: 110, borderRadius: "50%", objectFit: "cover", border: "3px solid var(--border)" }}
            />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{about.name}</div>
              <div style={{ fontSize: "0.8125rem", color: "var(--muted-fg)", marginTop: 4, fontFamily: "var(--font-mono)" }}>{about.handle}</div>
            </div>

            {/* Social links */}
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { href: about.linkedinUrl, icon: <LinkedInIcon />, label: "LinkedIn" },
                { href: about.twitterUrl, icon: <TwitterIcon />, label: "X" },
                { href: about.githubUrl, icon: <GithubIcon />, label: "GitHub" },
              ].map(({ href, icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 36,
                    height: 36,
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    color: "var(--muted-fg)",
                    textDecoration: "none",
                    transition: "all 0.15s",
                    backgroundColor: "var(--muted)",
                  }}
                  onMouseOver={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                    (e.currentTarget as HTMLElement).style.color = "var(--foreground)";
                  }}
                  onMouseOut={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                    (e.currentTarget as HTMLElement).style.color = "var(--muted-fg)";
                  }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--border)", marginBottom: 48 }} />

      {/* Skills */}
      <div style={{ marginBottom: 56 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.375rem", fontWeight: 600, margin: "0 0 20px" }}>
          Tecnologías & áreas de expertise
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {about.skills.map((skill) => (
            <span key={skill} style={{
              padding: "7px 14px",
              border: "1px solid var(--border)",
              borderRadius: 100,
              fontSize: "0.875rem",
              color: "var(--muted-fg)",
              backgroundColor: "var(--muted)",
              fontFamily: "var(--font-mono)",
              transition: "all 0.15s",
              cursor: "default",
            }}
              onMouseOver={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                (e.currentTarget as HTMLElement).style.color = "var(--foreground)";
              }}
              onMouseOut={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLElement).style.color = "var(--muted-fg)";
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--border)", marginBottom: 48 }} />

      {/* Experience */}
      <div style={{ marginBottom: 56 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.375rem", fontWeight: 600, margin: "0 0 28px" }}>
          Experiencia
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {about.experience.map((item, i) => (
            <div key={item.id} style={{
              display: "grid",
              gridTemplateColumns: "160px 1fr",
              gap: 24,
              padding: "24px 0",
              borderBottom: i < about.experience.length - 1 ? "1px solid var(--border)" : "none",
            }}>
              <div>
                <div style={{ fontSize: "0.8125rem", color: "var(--muted-fg)", fontFamily: "var(--font-mono)", lineHeight: 1.5 }}>{item.period}</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--subtext)", marginTop: 4 }}>{item.company}</div>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "1rem", marginBottom: 6 }}>{item.role}</div>
                <div style={{ fontSize: "0.9rem", color: "var(--muted-fg)", lineHeight: 1.7 }}>{item.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--border)", marginBottom: 48 }} />

      {/* Contact CTA */}
      <div style={{
        padding: "36px 40px",
        backgroundColor: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
        flexWrap: "wrap",
      }}>
        <div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 600, margin: "0 0 6px" }}>
            {about.ctaTitle}
          </h3>
          <p style={{ color: "var(--muted-fg)", margin: 0, fontSize: "0.9375rem" }}>
            {about.ctaText}
          </p>
        </div>
        <a
          href={`mailto:${about.email}`}
          style={{
            padding: "11px 24px",
            backgroundColor: "var(--accent)",
            color: "var(--accent-fg)",
            borderRadius: 6,
            textDecoration: "none",
            fontSize: "0.9375rem",
            fontWeight: 600,
            whiteSpace: "nowrap",
            transition: "opacity 0.15s",
            flexShrink: 0,
          }}
          onMouseOver={e => (e.currentTarget.style.opacity = "0.85")}
          onMouseOut={e => (e.currentTarget.style.opacity = "1")}
        >
          {about.ctaButtonLabel}
        </a>
      </div>

    </div>
  );
}
