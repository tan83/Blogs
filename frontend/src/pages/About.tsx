import { useEffect, useState } from "react";
import { useAbout } from "@/context/AboutContext";
import { api } from "@/lib/api";

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
  const [selectedLanguage, setSelectedLanguage] = useState<"original" | "en">("original");
  const [translatedHeadline, setTranslatedHeadline] = useState<string | null>(null);
  const [translatedBio, setTranslatedBio] = useState<string | null>(null);
  const [translatedCtaText, setTranslatedCtaText] = useState<string | null>(null);
  const [translatedCtaTitle, setTranslatedCtaTitle] = useState<string | null>(null);
  const [translatedCtaButtonLabel, setTranslatedCtaButtonLabel] = useState<string | null>(null);
  const [translatedSkills, setTranslatedSkills] = useState<string[] | null>(null);
  const [translatedExperience, setTranslatedExperience] = useState<typeof about.experience | null>(null);
  const [translating, setTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  const handleLanguageChange = async (language: "original" | "en") => {
    if (!about) return;

    if (language === "original") {
      setTranslatedHeadline(null);
      setTranslatedBio(null);
      setTranslatedCtaText(null);
      setTranslatedCtaTitle(null);
      setTranslatedCtaButtonLabel(null);
      setTranslatedSkills(null);
      setTranslatedExperience(null);
      setTranslationError(null);
      setSelectedLanguage(language);
      return;
    }

    try {
      setTranslating(true);
      setTranslationError(null);
      const result = await api<{ title?: string; excerpt?: string; content?: string }>("/posts/translate", {
        method: "POST",
        body: JSON.stringify({
          title: JSON.stringify({ headline: about.headline, ctaTitle: about.ctaTitle, ctaButtonLabel: about.ctaButtonLabel }),
          excerpt: JSON.stringify({ ctaText: about.ctaText }),
          content: JSON.stringify({ bio: about.bio, skills: about.skills, experience: about.experience }),
          structuredContent: true,
          sourceLanguage: "auto",
          targetLanguage: language,
        }),
      });
      const translatedHeader = JSON.parse(result.title || "{}") as Partial<{ headline: string; ctaTitle: string; ctaButtonLabel: string }>;
      const translatedCta = JSON.parse(result.excerpt || "{}") as Partial<{ ctaText: string }>;
      const translatedPage = JSON.parse(result.content || "{}") as Partial<{ bio: string; skills: string[]; experience: typeof about.experience }>;
      setTranslatedHeadline(translatedHeader.headline || about.headline);
      setTranslatedCtaTitle(translatedHeader.ctaTitle || about.ctaTitle);
      setTranslatedCtaButtonLabel(translatedHeader.ctaButtonLabel || about.ctaButtonLabel);
      setTranslatedCtaText(translatedCta.ctaText || about.ctaText);
      setTranslatedBio(translatedPage.bio || about.bio);
      setTranslatedSkills(translatedPage.skills || about.skills);
      setTranslatedExperience(translatedPage.experience || about.experience);
      setSelectedLanguage(language);
    } catch (error) {
      setTranslationError(error instanceof Error ? error.message : "No se pudo traducir esta página");
    } finally {
      setTranslating(false);
    }
  };

  useEffect(() => {
    const handleExternalLanguageChange = (event: Event) => {
      void handleLanguageChange((event as CustomEvent<"original" | "en">).detail);
    };
    window.addEventListener("about-language-change", handleExternalLanguageChange);
    return () => window.removeEventListener("about-language-change", handleExternalLanguageChange);
  });

  if (loading || !about) return null;

  const [firstName, ...restName] = about.name.split(" ");
  const displayedHeadline = translatedHeadline ?? about.headline;
  const displayedBio = translatedBio ?? about.bio;
  const displayedCtaText = translatedCtaText ?? about.ctaText;
  const displayedCtaTitle = translatedCtaTitle ?? about.ctaTitle;
  const displayedCtaButtonLabel = translatedCtaButtonLabel ?? about.ctaButtonLabel;
  const displayedSkills = translatedSkills ?? about.skills;
  const displayedExperience = translatedExperience ?? about.experience;
  const bioParagraphs = displayedBio.split("\n\n");

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "clamp(40px, 6vw, 72px) 24px 80px" }}>

      {/* Header */}
      <div style={{ marginBottom: 56 }}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)" }}>
            {selectedLanguage === "en" ? "About me" : "Sobre mí"}
          </div>
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
              {displayedHeadline}
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
          {selectedLanguage === "en" ? "Technologies & areas of expertise" : "Tecnologías & áreas de expertise"}
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {displayedSkills.map((skill) => (
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
          {selectedLanguage === "en" ? "Experience" : "Experiencia"}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {displayedExperience.map((item, i) => (
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
            {displayedCtaTitle}
          </h3>
          <p style={{ color: "var(--muted-fg)", margin: 0, fontSize: "0.9375rem" }}>
            {displayedCtaText}
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
          {displayedCtaButtonLabel}
        </a>
      </div>

    </div>
  );
}
