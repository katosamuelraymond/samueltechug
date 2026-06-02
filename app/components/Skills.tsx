"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const categories = [
  {
    title: "Frontend",
    icon: "🖥️",
    skills: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Inertia.js"],
  },
  {
    title: "Backend",
    icon: "⚙️",
    skills: ["Laravel", "NestJS", "Node.js", "PHP"],
  },
  {
    title: "Mobile",
    icon: "📱",
    skills: ["Flutter", "Dart"],
  },
  {
    title: "DevOps",
    icon: "🚀",
    skills: ["Docker", "GitHub Actions", "Linux", "Traefik", "VPS Management", "CI/CD"],
  },
  {
    title: "Database",
    icon: "🗄️",
    skills: ["MySQL", "PostgreSQL", "SQLite", "Supabase", "Prisma", "Hive"],
  },
  {
    title: "Tools",
    icon: "🛠️",
    skills: ["Git", "VS Code", "DBeaver", "Postman", "Cloudinary"],
  },
];

export default function Skills() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="skills" className="py-24 bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-orange-400 font-mono text-sm tracking-widest uppercase mb-3">What I work with</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Skills & Technologies</h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -4, borderColor: "rgba(249,115,22,0.4)" }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 transition-colors"
            >
              <div className="flex items-center gap-3 mb-5">
                <span className="text-2xl">{cat.icon}</span>
                <h3 className="text-lg font-semibold text-white">{cat.title}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {cat.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs font-medium px-3 py-1.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 hover:border-orange-500/50 hover:text-orange-300 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
