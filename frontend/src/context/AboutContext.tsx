import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
  order: number;
}

export interface AboutData {
  id: string;
  name: string;
  headline: string;
  bio: string;
  avatarImage: string;
  handle: string;
  email: string;
  linkedinUrl: string;
  twitterUrl: string;
  githubUrl: string;
  skills: string[];
  ctaTitle: string;
  ctaText: string;
  ctaButtonLabel: string;
  experience: Experience[];
}

type ProfileUpdates = Partial<Omit<AboutData, "id" | "experience">>;
type ExperienceInput = Omit<Experience, "id" | "order"> & { order?: number };

interface AboutContextType {
  about: AboutData | null;
  loading: boolean;
  refresh: () => Promise<void>;
  updateProfile: (updates: ProfileUpdates) => Promise<void>;
  addExperience: (data: ExperienceInput) => Promise<void>;
  updateExperience: (id: string, updates: Partial<ExperienceInput>) => Promise<void>;
  deleteExperience: (id: string) => Promise<void>;
}

const AboutContext = createContext<AboutContextType>({
  about: null,
  loading: true,
  refresh: async () => {},
  updateProfile: async () => {},
  addExperience: async () => {},
  updateExperience: async () => {},
  deleteExperience: async () => {},
});

function sortExperience(experience: Experience[]) {
  return experience.slice().sort((a, b) => a.order - b.order);
}

export function AboutProvider({ children }: { children: React.ReactNode }) {
  const [about, setAbout] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await api<AboutData>("/about");
      setAbout({ ...data, experience: sortExperience(data.experience) });
    } catch (error) {
      console.error("Failed to load about profile", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateProfile = async (updates: ProfileUpdates) => {
    const updated = await api<AboutData>("/about", {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    setAbout((prev) => (prev ? { ...prev, ...updated, experience: prev.experience } : updated));
  };

  const addExperience = async (data: ExperienceInput) => {
    const created = await api<Experience>("/about/experience", {
      method: "POST",
      body: JSON.stringify(data),
    });
    setAbout((prev) => (prev ? { ...prev, experience: sortExperience([...prev.experience, created]) } : prev));
  };

  const updateExperience = async (id: string, updates: Partial<ExperienceInput>) => {
    const updated = await api<Experience>(`/about/experience/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    setAbout((prev) =>
      prev ? { ...prev, experience: sortExperience(prev.experience.map((e) => (e.id === id ? updated : e))) } : prev
    );
  };

  const deleteExperience = async (id: string) => {
    await api<void>(`/about/experience/${id}`, { method: "DELETE" });
    setAbout((prev) => (prev ? { ...prev, experience: prev.experience.filter((e) => e.id !== id) } : prev));
  };

  return (
    <AboutContext.Provider
      value={{ about, loading, refresh, updateProfile, addExperience, updateExperience, deleteExperience }}
    >
      {children}
    </AboutContext.Provider>
  );
}

export const useAbout = () => useContext(AboutContext);
