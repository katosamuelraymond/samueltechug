"use client";

const techs = [
  "Next.js", "React", "TypeScript", "Laravel", "Flutter", "Dart",
  "Node.js", "Docker", "PostgreSQL", "MySQL", "Tailwind CSS", "Prisma",
  "Supabase", "GitHub Actions", "Traefik", "NestJS", "Inertia.js", "PHP",
];

export default function TechMarquee() {
  const doubled = [...techs, ...techs];

  return (
    <div className="py-10 bg-zinc-950 border-y border-zinc-800 overflow-hidden">
      <div className="flex animate-marquee gap-10 w-max">
        {doubled.map((tech, i) => (
          <span
            key={i}
            className="text-sm font-medium text-zinc-500 hover:text-orange-400 transition-colors whitespace-nowrap flex items-center gap-2 cursor-default"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500/50" />
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}
