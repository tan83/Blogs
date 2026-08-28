import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { AUTHOR, INITIAL_POSTS } from "../../frontend/src/data/posts.ts";

const prisma = new PrismaClient();

const ABOUT_SEED = {
  name: "Jonathan Salgado Vega",
  headline:
    "Arquitecto de soluciones digitales con foco en transformación empresarial, inteligencia artificial e hiperautomatización. Trabajo con el ecosistema Microsoft — Copilot Studio, Azure AI, Power Platform — y con tecnologías modernas de desarrollo como React y Python.",
  bio: "Escribo sobre lo que construyo, lo que aprendo y lo que me hace pensar. Este espacio es mi cuaderno técnico y personal.",
  avatarImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&h=240&fit=crop&auto=format",
  handle: "@jonathansalgadovega",
  email: "jonathan@jhvs.dev",
  linkedinUrl: "https://linkedin.com",
  twitterUrl: "https://twitter.com",
  githubUrl: "https://github.com",
  skills: [
    "Digital Transformation", "AI & Automation", "Microsoft Copilot",
    "Copilot Studio", "Azure AI", "Power Platform", "Power Automate",
    "Python", "React", "Enterprise Architecture", "Hyperautomation", "Digital Strategy",
  ],
  ctaTitle: "¿Tienes un proyecto en mente?",
  ctaText: "Hablemos sobre cómo la IA y la automatización pueden transformar tu negocio.",
  ctaButtonLabel: "Escribir un mensaje",
};

const EXPERIENCE_SEED = [
  {
    role: "Solution Architect",
    company: "Microsoft Partner",
    period: "2023 — Presente",
    description: "Diseño e implementación de soluciones basadas en Azure AI, Copilot Studio y Power Platform para clientes enterprise.",
  },
  {
    role: "Tech Lead",
    company: "Consultoría Digital",
    period: "2021 — 2023",
    description: "Liderazgo técnico de equipos de desarrollo con foco en automatización e integración de sistemas empresariales.",
  },
  {
    role: "Software Engineer",
    company: "Startup SaaS",
    period: "2019 — 2021",
    description: "Desarrollo full-stack con React y Python. Arquitectura de microservicios y pipelines de datos.",
  },
];

async function main() {
  const author =
    (await prisma.author.findFirst({ where: { name: AUTHOR.name } })) ??
    (await prisma.author.create({ data: AUTHOR }));

  await prisma.author.update({ where: { id: author.id }, data: AUTHOR });

  for (const post of INITIAL_POSTS) {
    const publishedAt = new Date(`${post.publishedAt}T00:00:00.000Z`);
    const data = {
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      tags: post.tags,
      coverImage: post.coverImage,
      publishedAt,
      readTime: post.readTime,
      status: post.status,
      views: post.views,
      featured: post.featured ?? false,
      authorId: author.id,
    };

    await prisma.post.upsert({
      where: { slug: post.slug },
      update: data,
      create: { slug: post.slug, ...data },
    });
  }

  const password = await bcrypt.hash("pass1234", 10);
  await prisma.admin.upsert({
    where: { email: "admin@blog.dev" },
    update: { password },
    create: { email: "admin@blog.dev", password },
  });

  const about =
    (await prisma.about.findFirst()) ??
    (await prisma.about.create({ data: ABOUT_SEED }));

  await prisma.about.update({ where: { id: about.id }, data: ABOUT_SEED });

  for (const [index, item] of EXPERIENCE_SEED.entries()) {
    const existing = await prisma.experience.findFirst({
      where: { aboutId: about.id, role: item.role, company: item.company },
    });
    const data = { ...item, order: index, aboutId: about.id };
    if (existing) {
      await prisma.experience.update({ where: { id: existing.id }, data });
    } else {
      await prisma.experience.create({ data });
    }
  }

  console.log("Seed completed: author, posts, admin user and about profile are ready.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());