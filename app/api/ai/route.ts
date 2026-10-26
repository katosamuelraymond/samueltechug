import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";

// Helper to get GitHub token from env or data/settings.json
async function getGitHubToken(): Promise<string> {
  if (process.env.ADMIN_GITHUB_TOKEN && process.env.ADMIN_GITHUB_TOKEN.trim()) {
    return process.env.ADMIN_GITHUB_TOKEN.trim();
  }
  try {
    const settingsPath = path.join(process.cwd(), "data", "settings.json");
    const raw = await fs.readFile(settingsPath, "utf-8");
    const json = JSON.parse(raw);
    if (json.githubToken && typeof json.githubToken === "string") {
      return json.githubToken.trim();
    }
  } catch {
    // ignore
  }
  return "";
}

// Load data files for AI knowledge base
async function getKnowledgeBase() {
  const cwd = process.cwd();
  try {
    const [profile, projects, experience, services] = await Promise.all([
      fs.readFile(path.join(cwd, "data", "profile.json"), "utf-8").then(JSON.parse).catch(() => ({})),
      fs.readFile(path.join(cwd, "data", "projects.json"), "utf-8").then(JSON.parse).catch(() => ([])),
      fs.readFile(path.join(cwd, "data", "experience.json"), "utf-8").then(JSON.parse).catch(() => ([])),
      fs.readFile(path.join(cwd, "data", "services.json"), "utf-8").then(JSON.parse).catch(() => ([])),
    ]);
    return { profile, projects, experience, services };
  } catch {
    return { profile: {}, projects: [], experience: [], services: [] };
  }
}

async function isAuthed() {
  const store = await cookies();
  const pwd   = process.env.ADMIN_PASSWORD || "0752084847sam";
  return pwd !== "" && store.get("admin_session")?.value === pwd;
}

// Fallback intelligent answer engine if no external LLM API key is set
function answerVisitorQuery(query: string, kb: Awaited<ReturnType<typeof getKnowledgeBase>>): string {
  const q = query.toLowerCase();
  const { profile, projects } = kb;

  // Flutter / Mobile
  if (q.includes("flutter") || q.includes("mobile") || q.includes("android") || q.includes("ios") || q.includes("dart")) {
    const mobileProjects = projects.filter(
      (p: { tech?: string[]; category?: string }) =>
        p.tech?.some((t: string) => /flutter|dart|mobile|hive/i.test(t)) || p.category === "Mobile App"
    );
    const titles = mobileProjects.map((p: { title: string; subtitle?: string }) => `• **${p.title}** (${p.subtitle})`).join("\n");
    return `Samuel is an experienced mobile engineer specializing in **Flutter & Dart**. He has built several production-grade mobile applications with offline-first architecture, local caching (Hive), and real-time backend synchronization (Supabase/PostgreSQL):\n\n${titles}\n\nKey highlights include **AgroLink** (an offline-first supply chain app for Ugandan farmers) and **Fintrack** (a cross-platform personal finance manager with visual analytics).`;
  }

  // Next.js / React / Frontend
  if (q.includes("next") || q.includes("react") || q.includes("frontend") || q.includes("typescript")) {
    return `In modern web development, Samuel focuses heavily on **Next.js (App Router, Server Components)**, **TypeScript**, **React**, and **Tailwind CSS**.\n\nA prime example is **Creative Cube**, a production SaaS furniture e-commerce platform built with Next.js streaming, Prisma ORM, Cloudinary media optimization, and Docker CI/CD. He has also built responsive React frontends for enterprise systems and portals (such as **Zila Insurance** using Inertia.js + React).`;
  }

  // Laravel / Backend / PHP
  if (q.includes("laravel") || q.includes("backend") || q.includes("php") || q.includes("mysql") || q.includes("sql") || q.includes("api")) {
    return `On the backend, Samuel has extensive production experience architecting robust RESTful APIs and enterprise ERPs with **Laravel** and **MySQL**.\n\nNotable platforms include:\n• **POS System**: Multi-branch ERP with real-time inventory tracking and granular RBAC (Spatie Permissions + Laravel Sanctum).\n• **Savings SACCO**: Financial management system handling loan amortizations and member dividends.\n• **School System**: Multi-institution school ERP managing fees, grading, and timetables.`;
  }

  // Docker / DevOps
  if (q.includes("docker") || q.includes("devops") || q.includes("deploy") || q.includes("ci/cd") || q.includes("server")) {
    return `Samuel implements automated CI/CD and containerized DevOps infrastructure. He containerizes applications using **Docker** and **Docker Compose**, configures NGINX reverse proxies, automated SSL certificates, and GitHub Actions deployment workflows targeting production Linux VPS environments.`;
  }

  // Creative Cube
  if (q.includes("creative cube")) {
    return `**Creative Cube** is one of Samuel's flagship projects. It is a full-stack SaaS furniture e-commerce platform built with:\n• **Tech Stack:** Next.js, TypeScript, Prisma, PostgreSQL, Cloudinary, Tailwind CSS, Docker.\n• **Architecture:** Leverages Next.js Server Components, structured database migrations with Prisma, automated media transformation via Cloudinary, and containerized Docker deployment.`;
  }

  // Experience / Background / Bio
  if (q.includes("who is") || q.includes("about") || q.includes("background") || q.includes("years") || q.includes("experience")) {
    return `**Kato Samuel** is a Full-Stack & Mobile Developer based in Kampala, Uganda with over 3+ years of professional engineering experience. He specializes in architecting end-to-end web and mobile applications from scratch—spanning system architecture, database design, modern frontends, and production deployment.\n\nHe has shipped 13+ production projects across E-Commerce, Enterprise ERPs, Agricultural Logistics, and FinTech.`;
  }

  // Contact / Hire
  if (q.includes("contact") || q.includes("hire") || q.includes("email") || q.includes("reach") || q.includes("call") || q.includes("work with")) {
    return `You can reach out to Kato Samuel directly:\n• **Email:** [${profile.email || "katosamuelraymondmarvinhosborn@gmail.com"}](mailto:${profile.email || "katosamuelraymondmarvinhosborn@gmail.com"})\n• **Location:** ${profile.location || "Kampala, Uganda"}\n• **GitHub:** [github.com/katosamuelraymond](${profile.github || "https://github.com/katosamuelraymond"})\n\nOr you can use the **Contact Form** at the bottom of this portfolio to send a direct inquiry!`;
  }

  // General project overview
  return `Samuel has built **${projects.length} production projects** across web, mobile, and cloud:\n\n• **Flagship Web:** Creative Cube (Next.js & Prisma SaaS), Zila Insurance (Laravel 11 & React).\n• **Mobile Apps:** AgroLink (Offline-first Flutter), Fintrack (Personal Finance), Hermus Global Hauls.\n• **Enterprise ERPs:** Multi-branch POS System, Savings SACCO, School System.\n\nAsk me about any specific project, framework (Next.js, Flutter, Laravel, Docker), or how to get in touch!`;
}

// AI Project generator assistant
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateProjectDraft(promptText: string, repoUrl?: string, repoData?: any) {
  let defaultTitle = repoData?.name
    ? repoData.name.replace(/[-_]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())
    : "New Project";
  let description = repoData?.description || promptText || "Production-grade application designed for high performance, reliability, and modern user experience.";
  let tech: string[] = [];
  let tags: string[] = [];
  let category = "Full-Stack Web";
  let github = repoData?.url || repoUrl || "https://github.com/katosamuelraymond";
  let live = repoData?.homepage || "";
  let highlights = [
    "High-performance architecture with clean separation of concerns",
    "Comprehensive data validation and error boundary protection",
    "Optimized for fast rendering and fluid interactive states",
  ];

  const token = await getGitHubToken();

  // If repoUrl or repoData is given, analyze deeper
  if (repoData) {
    if (repoData.language) {
      if (repoData.language === "Dart") {
        category = "Mobile App";
        tech = ["Flutter", "Dart", "State Management", "REST APIs"];
        tags = ["Flutter", "Dart"];
        highlights = [
          "Cross-platform 60fps mobile architecture built with Flutter & Dart",
          "Offline-first local caching with background cloud sync",
          "Clean responsive UI with native gesture interactions",
        ];
      } else if (repoData.language === "PHP" || repoData.language === "Blade") {
        category = "Enterprise Systems";
        tech = ["Laravel", "PHP", "MySQL", "Tailwind CSS"];
        tags = ["Laravel", "PHP"];
        highlights = [
          "Scalable relational database schema with indexed queries and migrations",
          "Role-based access control (RBAC) and enterprise authorization policies",
          "Automated transactional workflows and audit logging",
        ];
      } else if (repoData.language === "TypeScript" || repoData.language === "JavaScript") {
        category = "Full-Stack Web";
        tech = ["Next.js", "TypeScript", "Tailwind CSS", "React"];
        tags = ["Next.js", "TypeScript"];
        highlights = [
          "Modern App Router architecture with streaming React Server Components",
          "End-to-end type safety with TypeScript and Zod validation",
          "Containerized production deployment workflow with automated CI/CD",
        ];
      } else if (repoData.language === "Python") {
        category = "AI & Backend";
        tech = ["Python", "FastAPI", "PostgreSQL", "Docker"];
        tags = ["Python", "FastAPI"];
      }
    }

    if (Array.isArray(repoData.topics) && repoData.topics.length > 0) {
      const topicTags = repoData.topics.map((t: string) => t.charAt(0).toUpperCase() + t.slice(1));
      tags = Array.from(new Set([...tags, ...topicTags])).slice(0, 4);
      tech = Array.from(new Set([...tech, ...topicTags])).slice(0, 6);
    }
  } else if (repoUrl && repoUrl.includes("github.com/")) {
    try {
      const match = repoUrl.match(/github\.com\/([^/]+)\/([^/?#]+)/);
      if (match) {
        const [, owner, repo] = match;
        const headers: Record<string, string> = { "User-Agent": "SamuelTechUg-AI" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers, cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          defaultTitle = data.name.replace(/[-_]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
          if (data.description) description = data.description;
          if (data.homepage) live = data.homepage;
          github = data.html_url;

          if (data.language === "Dart") {
            category = "Mobile App";
            tech = ["Flutter", "Dart", "State Management"];
            tags = ["Flutter", "Dart"];
            highlights = [
              "Cross-platform 60fps mobile architecture built with Flutter & Dart",
              "Offline-first local caching with background cloud sync",
              "Clean responsive UI with native gesture interactions",
            ];
          } else if (data.language === "PHP" || data.language === "Blade") {
            category = "Enterprise Systems";
            tech = ["Laravel", "PHP", "MySQL", "Tailwind CSS"];
            tags = ["Laravel", "PHP"];
            highlights = [
              "Scalable relational database schema with indexed queries and migrations",
              "Role-based access control (RBAC) and enterprise authorization policies",
              "Automated transactional workflows and audit logging",
            ];
          } else if (data.language === "TypeScript" || data.language === "JavaScript") {
            category = "Full-Stack Web";
            tech = ["Next.js", "TypeScript", "Tailwind CSS", "React"];
            tags = ["Next.js", "TypeScript"];
            highlights = [
              "Modern App Router architecture with streaming React Server Components",
              "End-to-end type safety with TypeScript and Zod validation",
              "Containerized production deployment workflow with automated CI/CD",
            ];
          }
        }
      }
    } catch (e) {
      console.warn("Could not fetch github repo metadata:", e);
    }
  } else {
    // Infer from text prompt
    const textLower = promptText.toLowerCase();
    if (textLower.includes("flutter") || textLower.includes("dart") || textLower.includes("mobile") || textLower.includes("app")) {
      category = "Mobile App";
      tech = ["Flutter", "Dart", "Supabase", "Mobile Architecture"];
      tags = ["Flutter", "Dart"];
      highlights = [
        "Cross-platform 60fps mobile UI designed with Flutter & Dart",
        "Offline-first data layer with SQLite/Hive caching",
        "Clean BLoC / Provider state management architecture",
      ];
    } else if (textLower.includes("laravel") || textLower.includes("php") || textLower.includes("sacco") || textLower.includes("pos") || textLower.includes("erp")) {
      category = "Enterprise Systems";
      tech = ["Laravel", "MySQL", "Tailwind CSS", "RBAC", "PHP"];
      tags = ["Laravel", "PHP"];
      highlights = [
        "Multi-branch enterprise ERP schema with ACID transactions",
        "Granular RBAC authorization with audit trails",
        "Automated PDF reporting and Excel export integrations",
      ];
    } else if (textLower.includes("next") || textLower.includes("react") || textLower.includes("saas") || textLower.includes("ecommerce")) {
      category = "Full-Stack Web";
      tech = ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL", "Docker"];
      tags = ["Next.js", "TypeScript"];
      highlights = [
        "Next.js App Router with Server Actions and ISR caching",
        "Prisma ORM schema with PostgreSQL relational indexing",
        "Automated CI/CD containerization with Docker & GitHub Actions",
      ];
    }

    const titleMatch = promptText.match(/["']([^"']+)["']/) || promptText.match(/^([A-Za-z0-9 ]{3,25})/);
    if (titleMatch && titleMatch[1]) {
      defaultTitle = titleMatch[1].trim();
    }
  }

  if (tech.length === 0) {
    tech = ["TypeScript", "Next.js", "Tailwind CSS"];
  }
  if (tags.length === 0) {
    tags = [tech[0] || "Next.js", tech[1] || "TypeScript"];
  }

  const draft = {
    title: defaultTitle,
    subtitle: `${category} · Engineered by Kato Samuel`,
    description: description.length > 280 ? description.slice(0, 277) + "..." : description,
    category,
    tech,
    tags,
    highlights,
    github,
    live: live || undefined,
    featured: false,
  };

  return {
    draft,
    inquiryMessage: `I've analyzed the repository **"${draft.title}"** and created an executive showcase draft.\n\nReview the details below. Would you like me to upload and publish this project to your live portfolio?`,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode } = body;

    // 1. Visitor Chat Mode
    if (mode === "visitor_chat") {
      const { message } = body;
      if (!message || typeof message !== "string") {
        return NextResponse.json({ error: "Message is required" }, { status: 400 });
      }

      const kb = await getKnowledgeBase();

      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (geminiApiKey) {
        try {
          const prompt = `You are the AI assistant on Kato Samuel's developer portfolio website (samueltechug.dev).
You speak warmly, professionally, and concisely on Samuel's behalf.
Samuel is a Full-Stack & Mobile Developer from Kampala, Uganda.
Here is the factual data about Samuel:
- Bio & Profile: ${JSON.stringify(kb.profile)}
- Projects: ${JSON.stringify(kb.projects)}
- Experience: ${JSON.stringify(kb.experience)}
- Services: ${JSON.stringify(kb.services)}

Answer the user's inquiry accurately based on the above facts. Keep formatting clean with markdown bullet points if helpful.
User question: "${message}"`;

          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          });
          if (res.ok) {
            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              return NextResponse.json({ reply: text });
            }
          }
        } catch {
          // Fall back gracefully to internal knowledge engine
        }
      }

      const reply = answerVisitorQuery(message, kb);
      return NextResponse.json({ reply });
    }

    // 2. AI Project Generator Mode (for Admin)
    if (mode === "generate_project") {
      if (!(await isAuthed())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { prompt, repoUrl, repoData } = body;
      const result = await generateProjectDraft(prompt || "", repoUrl, repoData);
      return NextResponse.json(result);
    }

    // 3. Confirm & Publish Project (Real-time Upload)
    if (mode === "publish_project") {
      if (!(await isAuthed())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { project } = body;
      if (!project || !project.title) {
        return NextResponse.json({ error: "Project data is required" }, { status: 400 });
      }

      const projectsPath = path.join(process.cwd(), "data", "projects.json");
      const raw = await fs.readFile(projectsPath, "utf-8");
      const projects = JSON.parse(raw);

      // Prepend the new project so it appears first in the showcase
      const updatedProjects = [project, ...projects.filter((p: { title: string }) => p.title.toLowerCase() !== project.title.toLowerCase())];

      await fs.writeFile(projectsPath, JSON.stringify(updatedProjects, null, 2) + "\n", "utf-8");

      return NextResponse.json({
        success: true,
        message: `Project "${project.title}" has been published to your portfolio in real time!`,
        totalProjects: updatedProjects.length,
      });
    }

    return NextResponse.json({ error: "Invalid mode specified" }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
