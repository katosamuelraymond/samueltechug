export type Project = {
  title: string;
  subtitle: string;
  description: string;
  tech: string[];
  tags: string[];
  github: string;
  live?: string;
  image?: string;
  category?: string;
  featured?: boolean;
  highlights?: string[];
};

import projectsData from "./projects.json";

const projects: Project[] = projectsData as Project[];

export default projects;
