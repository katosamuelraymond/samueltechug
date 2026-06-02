import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import TechMarquee from "./components/TechMarquee";
import About from "./components/About";
import Services from "./components/Services";
import Skills from "./components/Skills";
import Experience from "./components/Experience";
import Projects from "./components/Projects";
import Testimonials from "./components/Testimonials";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Kato Samuel",
  url: "https://samueltechug.dev",
  image: "https://samueltechug.dev/profile.jpg",
  jobTitle: "Full Stack & Mobile Developer",
  description:
    "Full-stack and mobile developer based in Kampala, Uganda. Building production-grade web and mobile applications with Next.js, Laravel, Flutter, and Docker.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Kampala",
    addressCountry: "UG",
  },
  email: "katosamuelraymondmarvinhosborn@gmail.com",
  sameAs: ["https://github.com/katosamuelraymond"],
  knowsAbout: [
    "Next.js", "React", "TypeScript", "Laravel", "Flutter", "Dart",
    "Docker", "Node.js", "PostgreSQL", "MySQL", "GitHub Actions",
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main>
        <Hero />
        <TechMarquee />
        <About />
        <Services />
        <Skills />
        <Experience />
        <Projects />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
