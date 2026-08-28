import type { Prisma } from "@prisma/client";

export type AboutWithExperience = Prisma.AboutGetPayload<{
  include: { experience: true };
}>;

export function toAboutDto(about: AboutWithExperience) {
  return {
    id: about.id,
    name: about.name,
    headline: about.headline,
    bio: about.bio,
    avatarImage: about.avatarImage,
    handle: about.handle,
    email: about.email,
    linkedinUrl: about.linkedinUrl,
    twitterUrl: about.twitterUrl,
    githubUrl: about.githubUrl,
    skills: about.skills,
    ctaTitle: about.ctaTitle,
    ctaText: about.ctaText,
    ctaButtonLabel: about.ctaButtonLabel,
    experience: about.experience
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((item) => ({
        id: item.id,
        role: item.role,
        company: item.company,
        period: item.period,
        description: item.description,
        order: item.order,
      })),
  };
}
