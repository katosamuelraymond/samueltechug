export type Project = {
  title: string;
  subtitle: string;
  description: string;
  tech: string[];
  tags: string[];
  github: string;
  live?: string;
};

// ─────────────────────────────────────────────────────────────
//  ADD OR EDIT PROJECTS HERE
//  - title      : project name
//  - subtitle   : one-line description shown under the title
//  - description: paragraph shown on the card
//  - tech       : list of technologies (shown as small badges)
//  - tags       : used for the filter buttons (keep consistent)
//  - github     : full GitHub URL
//  - live       : optional live URL (omit the line if none)
// ─────────────────────────────────────────────────────────────

const projects: Project[] = [
  {
    title: "Creative Cube",
    subtitle: "Full-Stack SaaS E-Commerce Platform",
    description:
      "Architected a production-ready SaaS furniture e-commerce platform with server-component architecture, structured Prisma database migrations, Cloudinary media management, and automated CI/CD deployment.",
    tech: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Cloudinary", "Tailwind CSS", "Docker"],
    tags: ["Next.js", "TypeScript", "Docker"],
    github: "https://github.com/katosamuelraymond/creative-cube-next",
    live: "https://next.conquerer.org",
  },
  {
    title: "POS System",
    subtitle: "Enterprise Point-of-Sale and ERP",
    description:
      "Built a full-featured POS and ERP platform with multi-branch support, real-time inventory tracking, financial reporting, and fine-grained role-based access control for multiple user roles.",
    tech: ["Laravel", "React", "MySQL", "Laravel Sanctum", "Spatie Permissions", "Docker"],
    tags: ["Laravel", "React", "Docker"],
    github: "https://github.com/katosamuelraymond/POS_SYSTEM",
    live: "https://pos-staging.conquerer.org",
  },
  {
    title: "AgroLink",
    subtitle: "Agricultural Supply Chain Mobile App",
    description:
      "Engineered an offline-first Flutter application connecting farmers, buyers, and transporters in low connectivity rural environments. Designed to reduce post-harvest losses and improve agricultural trade efficiency across Uganda.",
    tech: ["Flutter", "Dart", "Hive", "Offline-first Architecture"],
    tags: ["Flutter", "Dart"],
    github: "https://github.com/katosamuelraymond/agrolink",
  },
  {
    title: "Fintrack",
    subtitle: "Personal Finance Mobile Application",
    description:
      "Built a cross-platform mobile finance manager with income and expense tracking, budget goal setting, and visual analytics dashboards. Integrated Supabase for real-time data synchronisation and secure multi-device authentication.",
    tech: ["Flutter", "Dart", "Supabase", "PostgreSQL"],
    tags: ["Flutter", "Dart"],
    github: "https://github.com/katosamuelraymond/Fintrack",
  },
  {
    title: "Savings SACCO",
    subtitle: "SACCO Management System",
    description:
      "Designed a full SACCO platform for member registration, savings, loan applications, repayment schedules, and automated financial statements. Replaced entirely manual bookkeeping with automated workflows.",
    tech: ["Laravel", "MySQL", "Role-Based Access Control"],
    tags: ["Laravel"],
    github: "https://github.com/katosamuelraymond/savings-sacco",
  },
  {
    title: "E-Learning Platform",
    subtitle: "Learning Management System",
    description:
      "Developed a comprehensive LMS supporting course creation, online examinations, assignment submission, and student performance tracking.",
    tech: ["Laravel", "MySQL", "Tailwind CSS"],
    tags: ["Laravel"],
    github: "https://github.com/katosamuelraymond/elearning-platform",
  },
  {
    title: "Zila Insurance",
    subtitle: "CMS Platform",
    description:
      "Built a corporate website with integrated CMS enabling non-technical staff to manage pages, publish articles, and update content independently. Implemented React frontend with Inertia.js for seamless SPA experience.",
    tech: ["Laravel 11", "React", "Inertia.js"],
    tags: ["Laravel", "React"],
    github: "https://github.com/katosamuelraymond/zilawebsite",
  },
];

export default projects;
