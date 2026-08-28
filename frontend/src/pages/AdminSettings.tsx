import { useEffect, useRef, useState } from "react";
import { useAbout, type Experience } from "@/context/AboutContext";
import { api } from "@/lib/api";

const SETTINGS_SECTIONS = [{ key: "profile", label: "Perfil" }] as const;

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  backgroundColor: "var(--muted)",
  border: "1px solid var(--border)",
  borderRadius: 5,
  color: "var(--foreground)",
  fontSize: "0.875rem",
  fontFamily: "var(--font-sans)",
  outline: "none",
  transition: "border-color 0.15s",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.75rem",
  fontFamily: "var(--font-mono)",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "var(--muted-fg)",
  marginBottom: 6,
};

function focusAccent(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = "var(--accent)";
}
function blurBorder(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = "var(--border)";
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
      {hint && <div style={{ fontSize: "0.6875rem", color: "var(--muted-fg)", marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

function saveButtonStyle(disabled: boolean): React.CSSProperties {
  return {
    padding: "9px 20px",
    backgroundColor: "var(--accent)",
    color: "var(--accent-fg)",
    border: "none",
    borderRadius: 6,
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "var(--font-sans)",
    opacity: disabled ? 0.5 : 1,
    transition: "opacity 0.15s",
  };
}

type ExperienceFormValues = { role: string; company: string; period: string; description: string };

function ExperienceRow({
  item,
  onSave,
  onDelete,
}: {
  item: Experience;
  onSave: (id: string, data: ExperienceFormValues) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [role, setRole] = useState(item.role);
  const [company, setCompany] = useState(item.company);
  const [period, setPeriod] = useState(item.period);
  const [description, setDescription] = useState(item.description);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const cancelEdit = () => {
    setRole(item.role);
    setCompany(item.company);
    setPeriod(item.period);
    setDescription(item.description);
    setError("");
    setEditing(false);
  };

  const handleSave = async () => {
    if (!role.trim() || !company.trim() || !period.trim()) return;
    setSaving(true);
    setError("");
    try {
      await onSave(item.id, {
        role: role.trim(),
        company: company.trim(),
        period: period.trim(),
        description: description.trim(),
      });
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    try {
      await onDelete(item.id);
    } catch (err) {
      console.error("Failed to delete experience", err);
    }
  };

  if (editing) {
    return (
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Rol" style={inputStyle} onFocus={focusAccent} onBlur={blurBorder} />
          <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Empresa" style={inputStyle} onFocus={focusAccent} onBlur={blurBorder} />
        </div>
        <input value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="Periodo (ej. 2023 — Presente)" style={inputStyle} onFocus={focusAccent} onBlur={blurBorder} />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción"
          rows={3}
          style={{ ...inputStyle, resize: "vertical", lineHeight: 1.55 }}
          onFocus={focusAccent}
          onBlur={blurBorder}
        />
        {error && <div style={{ fontSize: "0.75rem", color: "#EF4444" }}>{error}</div>}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleSave} disabled={saving || !role.trim() || !company.trim()} style={saveButtonStyle(saving || !role.trim() || !company.trim())}>
            {saving ? "Guardando…" : "Guardar"}
          </button>
          <button
            onClick={cancelEdit}
            style={{ padding: "9px 16px", background: "var(--muted)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--foreground)", fontSize: "0.875rem", cursor: "pointer", fontFamily: "var(--font-sans)" }}
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, padding: "16px 20px", borderBottom: "1px solid var(--border)", transition: "background 0.1s" }}
      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "var(--muted)")}
      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
          {item.role} <span style={{ color: "var(--muted-fg)", fontWeight: 400 }}>· {item.company}</span>
        </div>
        <div style={{ fontSize: "0.75rem", color: "var(--muted-fg)", fontFamily: "var(--font-mono)", marginTop: 4 }}>{item.period}</div>
        <div style={{ fontSize: "0.8125rem", color: "var(--muted-fg)", marginTop: 6, lineHeight: 1.6 }}>{item.description}</div>
      </div>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <button
          onClick={() => setEditing(true)}
          style={{ padding: "5px 12px", background: "var(--muted)", border: "1px solid var(--border)", borderRadius: 5, color: "var(--foreground)", fontSize: "0.75rem", cursor: "pointer", fontFamily: "var(--font-sans)" }}
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          style={{
            padding: "5px 12px",
            background: confirmDelete ? "rgba(239,68,68,0.15)" : "transparent",
            border: `1px solid ${confirmDelete ? "rgba(239,68,68,0.5)" : "var(--border)"}`,
            borderRadius: 5,
            color: confirmDelete ? "#EF4444" : "var(--muted-fg)",
            fontSize: "0.75rem",
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
          }}
        >
          {confirmDelete ? "Confirm" : "Delete"}
        </button>
      </div>
    </div>
  );
}

function AddExperienceForm({ onAdd, onCancel }: { onAdd: (data: ExperienceFormValues) => Promise<void>; onCancel: () => void }) {
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [period, setPeriod] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async () => {
    if (!role.trim() || !company.trim() || !period.trim()) return;
    setSaving(true);
    setError("");
    try {
      await onAdd({ role: role.trim(), company: company.trim(), period: period.trim(), description: description.trim() });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo agregar");
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 10, backgroundColor: "var(--muted)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Rol" style={inputStyle} onFocus={focusAccent} onBlur={blurBorder} />
        <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Empresa" style={inputStyle} onFocus={focusAccent} onBlur={blurBorder} />
      </div>
      <input value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="Periodo (ej. 2023 — Presente)" style={inputStyle} onFocus={focusAccent} onBlur={blurBorder} />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descripción"
        rows={3}
        style={{ ...inputStyle, resize: "vertical", lineHeight: 1.55 }}
        onFocus={focusAccent}
        onBlur={blurBorder}
      />
      {error && <div style={{ fontSize: "0.75rem", color: "#EF4444" }}>{error}</div>}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={handleAdd} disabled={saving || !role.trim() || !company.trim()} style={saveButtonStyle(saving || !role.trim() || !company.trim())}>
          {saving ? "Guardando…" : "Agregar"}
        </button>
        <button
          onClick={onCancel}
          style={{ padding: "9px 16px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--foreground)", fontSize: "0.875rem", cursor: "pointer", fontFamily: "var(--font-sans)" }}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

export default function AdminSettings() {
  const { about, loading, updateProfile, addExperience, updateExperience, deleteExperience } = useAbout();
  const [activeSection, setActiveSection] = useState<(typeof SETTINGS_SECTIONS)[number]["key"]>("profile");
  const initialized = useRef(false);

  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [skills, setSkills] = useState("");
  const [avatarImage, setAvatarImage] = useState("");
  const [ctaTitle, setCtaTitle] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaButtonLabel, setCtaButtonLabel] = useState("");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAddExperience, setShowAddExperience] = useState(false);

  useEffect(() => {
    if (!about || initialized.current) return;
    setName(about.name);
    setHandle(about.handle);
    setHeadline(about.headline);
    setBio(about.bio);
    setEmail(about.email);
    setLinkedinUrl(about.linkedinUrl);
    setTwitterUrl(about.twitterUrl);
    setGithubUrl(about.githubUrl);
    setSkills(about.skills.join(", "));
    setAvatarImage(about.avatarImage);
    setCtaTitle(about.ctaTitle);
    setCtaText(about.ctaText);
    setCtaButtonLabel(about.ctaButtonLabel);
    initialized.current = true;
  }, [about]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setUploadError("");
    try {
      const dataUrl = await readFileAsDataURL(file);
      const res = await api<{ url: string }>("/images", {
        method: "POST",
        body: JSON.stringify({ data: dataUrl, mimeType: file.type }),
      });
      setAvatarImage(res.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setSaveError("");
    try {
      await updateProfile({
        name: name.trim(),
        handle: handle.trim(),
        headline: headline.trim(),
        bio,
        email: email.trim(),
        linkedinUrl: linkedinUrl.trim(),
        twitterUrl: twitterUrl.trim(),
        githubUrl: githubUrl.trim(),
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        avatarImage,
        ctaTitle: ctaTitle.trim(),
        ctaText: ctaText.trim(),
        ctaButtonLabel: ctaButtonLabel.trim(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "No se pudo guardar el perfil");
    } finally {
      setSaving(false);
    }
  };

  const filterPillStyle = (active: boolean): React.CSSProperties => ({
    padding: "6px 14px",
    borderRadius: 100,
    fontSize: "0.8125rem",
    border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
    backgroundColor: active ? "var(--accent)" : "transparent",
    color: active ? "var(--accent-fg)" : "var(--muted-fg)",
    cursor: "pointer",
    transition: "all 0.15s",
    fontWeight: active ? 500 : 400,
    fontFamily: "var(--font-sans)",
  });

  if (loading || !about) {
    return (
      <div style={{ padding: "32px 36px", flex: 1, color: "var(--muted-fg)" }}>Cargando…</div>
    );
  }

  return (
    <div style={{ padding: "32px 36px", flex: 1, overflow: "auto" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.625rem", fontWeight: 600, margin: 0 }}>Configuración</h1>
        <p style={{ color: "var(--muted-fg)", margin: "4px 0 0", fontSize: "0.875rem" }}>
          Administra la información pública de tu perfil y de la página "Sobre mí".
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {SETTINGS_SECTIONS.map((section) => (
          <button key={section.key} onClick={() => setActiveSection(section.key)} style={filterPillStyle(activeSection === section.key)}>
            {section.label}
          </button>
        ))}
      </div>

      {activeSection === "profile" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 720 }}>
          {/* Profile card */}
          <div style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: 24 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 600, margin: "0 0 16px" }}>Perfil</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Field label="Nombre completo">
                <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} onFocus={focusAccent} onBlur={blurBorder} />
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Usuario / handle">
                  <input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="@usuario" style={inputStyle} onFocus={focusAccent} onBlur={blurBorder} />
                </Field>
                <Field label="Email de contacto">
                  <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" style={inputStyle} onFocus={focusAccent} onBlur={blurBorder} />
                </Field>
              </div>

              <Field label="Titular / Headline">
                <textarea value={headline} onChange={(e) => setHeadline(e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.55 }} onFocus={focusAccent} onBlur={blurBorder} />
              </Field>

              <Field label="Biografía" hint='Usa una línea en blanco para separar párrafos.'>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.55 }} onFocus={focusAccent} onBlur={blurBorder} />
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <Field label="LinkedIn">
                  <input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} style={inputStyle} onFocus={focusAccent} onBlur={blurBorder} />
                </Field>
                <Field label="Twitter / X">
                  <input value={twitterUrl} onChange={(e) => setTwitterUrl(e.target.value)} style={inputStyle} onFocus={focusAccent} onBlur={blurBorder} />
                </Field>
                <Field label="GitHub">
                  <input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} style={inputStyle} onFocus={focusAccent} onBlur={blurBorder} />
                </Field>
              </div>

              <Field label="Skills" hint="Separados por comas">
                <input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, Python, Azure AI" style={inputStyle} onFocus={focusAccent} onBlur={blurBorder} />
              </Field>

              <Field label="Foto de perfil">
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  {avatarImage && (
                    <img src={avatarImage} alt="Avatar preview" style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border)", flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, display: "flex", gap: 8 }}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      style={{ display: "none" }}
                      onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      style={{
                        flex: 1,
                        padding: "9px 12px",
                        backgroundColor: "var(--muted)",
                        border: "1px solid var(--border)",
                        borderRadius: 5,
                        color: "var(--foreground)",
                        fontSize: "0.8125rem",
                        cursor: uploading ? "not-allowed" : "pointer",
                        fontFamily: "var(--font-sans)",
                        opacity: uploading ? 0.6 : 1,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {uploading ? "Subiendo…" : "Subir imagen"}
                    </button>
                    <input
                      value={avatarImage}
                      onChange={(e) => setAvatarImage(e.target.value)}
                      placeholder="…o pega una URL"
                      style={{ ...inputStyle, flex: 2 }}
                      onFocus={focusAccent}
                      onBlur={blurBorder}
                    />
                  </div>
                </div>
                {uploadError && <div style={{ fontSize: "0.75rem", color: "#EF4444", marginTop: 6 }}>{uploadError}</div>}
              </Field>

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "0.9375rem", fontWeight: 600, margin: 0 }}>Llamado a la acción</h3>
                <Field label="Título">
                  <input value={ctaTitle} onChange={(e) => setCtaTitle(e.target.value)} style={inputStyle} onFocus={focusAccent} onBlur={blurBorder} />
                </Field>
                <Field label="Texto">
                  <textarea value={ctaText} onChange={(e) => setCtaText(e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.55 }} onFocus={focusAccent} onBlur={blurBorder} />
                </Field>
                <Field label="Texto del botón">
                  <input value={ctaButtonLabel} onChange={(e) => setCtaButtonLabel(e.target.value)} style={inputStyle} onFocus={focusAccent} onBlur={blurBorder} />
                </Field>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 24 }}>
              <button onClick={handleSaveProfile} disabled={saving || !name.trim()} style={saveButtonStyle(saving || !name.trim())}>
                {saving ? "Guardando…" : "Guardar cambios"}
              </button>
              {saved && <span style={{ fontSize: "0.8125rem", color: "var(--accent)" }}>Guardado</span>}
              {saveError && <span style={{ fontSize: "0.8125rem", color: "#EF4444" }}>{saveError}</span>}
            </div>
          </div>

          {/* Experience card */}
          <div style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 600, margin: 0 }}>Experiencia</h2>
              <button
                onClick={() => setShowAddExperience((v) => !v)}
                style={{ padding: "6px 14px", background: "var(--muted)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--foreground)", fontSize: "0.8125rem", cursor: "pointer", fontFamily: "var(--font-sans)" }}
              >
                {showAddExperience ? "Cancelar" : "+ Agregar experiencia"}
              </button>
            </div>

            {showAddExperience && (
              <AddExperienceForm
                onAdd={async (data) => {
                  await addExperience(data);
                  setShowAddExperience(false);
                }}
                onCancel={() => setShowAddExperience(false)}
              />
            )}

            <div>
              {about.experience.map((item) => (
                <ExperienceRow key={item.id} item={item} onSave={updateExperience} onDelete={deleteExperience} />
              ))}
              {about.experience.length === 0 && !showAddExperience && (
                <div style={{ padding: 32, textAlign: "center", color: "var(--muted-fg)" }}>Aún no hay experiencia agregada.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
