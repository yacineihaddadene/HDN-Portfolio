"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api/client";
import type {
  Project,
  Skill,
  WorkExperience,
  Education,
  Hobby,
  Testimonial,
  ContactInfo,
  Resume,
  About,
} from "@/lib/api/client";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Link as LinkIcon,
  Github,
  Linkedin,
  ExternalLink,
  Star,
  Download,
  FileText,
  Sparkles,
} from "lucide-react";
import { SkillIcon } from "@/lib/skillIcons";

export default function Home() {
  const [lang, setLang] = useState<"en" | "fr">("en");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    projects: [] as Project[],
    skills: [] as Skill[],
    experiences: [] as WorkExperience[],
    education: [] as Education[],
    hobbies: [] as Hobby[],
    testimonials: [] as Testimonial[],
    contactInfo: [] as ContactInfo[],
    resume: null as Resume | null,
    about: null as About | null,
  });

  useEffect(() => {
    loadData();
  }, []);

  // Reload resume when language changes
  useEffect(() => {
    loadResume();
  }, [lang]);

  // Scroll progress and active section tracking
  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll progress
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const trackLength = documentHeight - windowHeight;
      const progress = (scrollTop / trackLength) * 100;
      setScrollProgress(progress);

      // Determine active section
      const sections = [
        "projects",
        "skills",
        "experience",
        "education",
        "hobbies",
        "testimonials",
        "resume",
        "contact",
      ];
      let currentSection = "";

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Check if section is in viewport (accounting for navbar)
          if (rect.top <= 100 && rect.bottom >= 100) {
            currentSection = section;
            break;
          }
        }
      }

      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial call

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const loadResume = async () => {
    try {
      const resume = await apiClient.getPublicResume(lang).catch((err) => {
        console.error("Failed to load resume:", err);
        return { resume: null };
      });

      setData((prevData) => ({
        ...prevData,
        resume: resume.resume || null,
      }));
    } catch (error) {
      console.error("Failed to load resume:", error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        projects,
        skills,
        experiences,
        education,
        hobbies,
        testimonials,
        contactInfo,
        resume,
        about,
      ] = await Promise.all([
        apiClient.getPublicProjects().catch((err) => {
          console.error("Failed to load projects:", err);
          return { projects: [] };
        }),
        apiClient.getPublicSkills().catch((err) => {
          console.error("Failed to load skills:", err);
          return { skills: [] };
        }),
        apiClient.getPublicExperience().catch((err) => {
          console.error("Failed to load experience:", err);
          return { experiences: [] };
        }),
        apiClient.getPublicEducation().catch((err) => {
          console.error("Failed to load education:", err);
          return { education: [] };
        }),
        apiClient.getPublicHobbies().catch((err) => {
          console.error("Failed to load hobbies:", err);
          return { hobbies: [] };
        }),
        apiClient.getPublicTestimonials().catch((err) => {
          console.error("Failed to load testimonials:", err);
          return { testimonials: [] };
        }),
        apiClient.getPublicContactInfo().catch((err) => {
          console.error("Failed to load contact info:", err);
          return { contactInfo: [] };
        }),
        apiClient.getPublicResume(lang).catch((err) => {
          console.error("Failed to load resume:", err);
          return { resume: null };
        }),
        apiClient.getPublicAbout().catch((err) => {
          console.error("Failed to load about:", err);
          return { about: null };
        }),
      ]);

      console.log("Resume API Response:", resume);
      console.log("Resume Data:", resume.resume);

      console.log("Loaded data:", {
        projects: projects.projects.length,
        skills: skills.skills.length,
        experiences: experiences.experiences.length,
        education: education.education.length,
        hobbies: hobbies.hobbies.length,
        testimonials: testimonials.testimonials.length,
        contactInfo: contactInfo.contactInfo.length,
        resume: resume.resume ? "Available" : "None",
      });

      setData({
        projects: projects.projects || [],
        skills: skills.skills || [],
        experiences: experiences.experiences || [],
        education: education.education || [],
        hobbies: hobbies.hobbies || [],
        testimonials: testimonials.testimonials || [],
        contactInfo: contactInfo.contactInfo || [],
        resume: resume.resume || null,
        about: about.about || null,
      });
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const t = (en: string, fr: string) => (lang === "en" ? en : fr);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
        {/* Animated background */}
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, hsl(270 80% 65% / 0.2) 0%, transparent 50%)",
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center relative z-10"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            <Sparkles className="w-12 h-12 text-accent mb-4" />
          </motion.div>
          <p className="text-lg text-muted-foreground font-display">
            Loading portfolio...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-md border-b border-border z-50 transition-all duration-300">
        {/* Scroll Progress Bar */}
        <motion.div
          className="absolute top-0 left-0 h-1 bg-gradient-to-r from-[hsl(270,80%,65%)] via-[hsl(220,90%,60%)] to-[hsl(270,80%,65%)]"
          style={{ width: `${scrollProgress}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${scrollProgress}%` }}
          transition={{ duration: 0.1 }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl font-bold font-display cursor-pointer hover:scale-105 transition-transform duration-200"
            >
              <span className="gradient-text">Portfolio</span>
              <span className="text-accent">.</span>
            </motion.h1>
            <div className="flex items-center gap-4 md:gap-6">
              <a
                href="#skills"
                className={`relative transition-all duration-300 group py-1 text-sm ${
                  activeSection === "skills"
                    ? "text-accent font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="relative z-10">
                  {t("Skills", "Compétences")}
                </span>
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-accent to-accent-secondary transition-all duration-300 ${
                    activeSection === "skills"
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </a>
              <a
                href="#projects"
                className={`relative transition-all duration-300 group py-1 text-sm ${
                  activeSection === "projects"
                    ? "text-accent font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="relative z-10">
                  {t("Projects", "Projets")}
                </span>
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-accent to-accent-secondary transition-all duration-300 ${
                    activeSection === "projects"
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </a>
              <a
                href="#experience"
                className={`relative transition-all duration-300 group py-1 text-sm hidden sm:block ${
                  activeSection === "experience"
                    ? "text-accent font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="relative z-10">
                  {t("Experience", "Expérience")}
                </span>
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-accent to-accent-secondary transition-all duration-300 ${
                    activeSection === "experience"
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </a>
              <a
                href="#education"
                className={`relative transition-all duration-300 group py-1 text-sm hidden md:block ${
                  activeSection === "education"
                    ? "text-accent font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="relative z-10">
                  {t("Education", "Formation")}
                </span>
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-accent to-accent-secondary transition-all duration-300 ${
                    activeSection === "education"
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </a>
              <a
                href="#hobbies"
                className={`relative transition-all duration-300 group py-1 text-sm hidden lg:block ${
                  activeSection === "hobbies"
                    ? "text-accent font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="relative z-10">{t("Hobbies", "Loisirs")}</span>
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-accent to-accent-secondary transition-all duration-300 ${
                    activeSection === "hobbies"
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </a>
              <a
                href="#testimonials"
                className={`relative transition-all duration-300 group py-1 text-sm hidden lg:block ${
                  activeSection === "testimonials"
                    ? "text-accent font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="relative z-10">{t("Testimonials", "Témoignages")}</span>
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-accent to-accent-secondary transition-all duration-300 ${
                    activeSection === "testimonials"
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </a>
              <a
                href="#resume"
                className={`relative transition-all duration-300 group py-1 text-sm hidden lg:block ${
                  activeSection === "resume"
                    ? "text-accent font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="relative z-10">{t("Resume", "CV")}</span>
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-accent to-accent-secondary transition-all duration-300 ${
                    activeSection === "resume"
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </a>
              <a
                href="#contact"
                className={`relative transition-all duration-300 group py-1 text-sm ${
                  activeSection === "contact"
                    ? "text-accent font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="relative z-10">{t("Contact", "Contact")}</span>
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-accent to-accent-secondary transition-all duration-300 ${
                    activeSection === "contact"
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </a>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setLang(lang === "en" ? "fr" : "en")}
                className="px-2 py-1 rounded-md bg-muted text-foreground text-xs font-medium hover:bg-accent hover:text-background transition-all duration-300"
              >
                {lang === "en" ? "FR" : "EN"}
              </motion.button>
              <Link
                href="/login"
                className="px-3 py-1.5 bg-foreground text-background rounded-md hover:bg-foreground/90 transition-all duration-300 text-xs font-semibold shadow-lg"
              >
                {t("Login", "Connexion")}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 pt-24 relative overflow-hidden">
        {/* Animated background gradients */}
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, hsl(270 80% 65% / 0.2) 0%, transparent 40%)",
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              "radial-gradient(circle at 70% 70%, hsl(220 90% 60% / 0.2) 0%, transparent 40%)",
          }}
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="gradient-text text-sm md:text-base mb-6 tracking-widest uppercase font-medium"
          >
            {data.about?.welcomeText[lang] ||
              t("Welcome to my portfolio", "Bienvenue sur mon portfolio")}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight mb-8 text-foreground"
          >
            {/* Always display name with gradient styling */}
            <>
              {t("My name is", "Je m'appelle")}
              <br />
              <span className="flex items-center gap-4 flex-wrap">
                <span className="gradient-text">
                  {t("Yacine Ihaddadene", "Yacine Ihaddadene")}
                </span>
                <motion.span
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="hidden md:block h-3 w-32 bg-gradient-to-r from-accent to-accent-secondary origin-left rounded-full"
                />
              </span>
            </>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-8 mt-16"
          >
            <motion.p
              className="text-muted-foreground max-w-md text-lg leading-relaxed"
              whileHover={{ x: 10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {data.about?.subtext[lang] ||
                t(
                  "Explore my work, skills, and professional journey",
                  "Découvrez mon travail, mes compétences et mon parcours professionnel",
                )}
            </motion.p>

            <motion.div
              className="flex items-center gap-2"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-6 h-10 border-2 border-accent/50 rounded-full flex justify-center pt-2">
                <motion.div
                  className="w-1 h-2 bg-gradient-to-b from-accent to-accent-secondary rounded-full"
                  animate={{ y: [0, 8, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
              <span className="text-sm text-muted-foreground">
                {t("Scroll to explore", "Faites défiler pour explorer")}
              </span>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <motion.div
          className="absolute bottom-20 right-10 w-64 h-64 border border-accent/10 rounded-full pointer-events-none"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute top-40 left-10 w-32 h-32 border border-accent-secondary/10 rounded-full pointer-events-none"
          animate={{ rotate: -360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </section>

      {/* Skills Section */}
      <section
        id="skills"
        className="py-20 px-6 md:px-12 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <p className="text-accent text-sm md:text-base mb-2 tracking-widest uppercase font-medium">
              {t("SKILLS & EXPERTISE", "COMPÉTENCES ET EXPERTISE")}
            </p>
            <h3 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              {t("What I", "Ce que je")}{" "}
              <span className="gradient-text">{t("Bring", "Apporte")}</span>
            </h3>
          </motion.div>
          <SkillsGrid skills={data.skills} lang={lang} />
        </div>
      </section>

      {/* Projects Section */}
      <section
        id="projects"
        className="py-20 px-6 md:px-12 bg-muted/30 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <p className="text-accent text-sm md:text-base mb-2 tracking-widest uppercase font-medium">
              {t("FEATURED WORK", "TRAVAUX EN VEDETTE")}
            </p>
            <h3 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              {t("Selected", "Projets")}{" "}
              <span className="gradient-text">
                {t("Projects", "Sélectionnés")}
              </span>
            </h3>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.projects.slice(0, 6).map((project) => (
              <ProjectCard key={project.id} project={project} lang={lang} />
            ))}
          </div>
          {data.projects.length === 0 && (
            <p className="text-center text-gray-400 text-lg col-span-full">
              {t("No projects yet", "Aucun projet pour le moment")}
            </p>
          )}
        </div>
      </section>

      {/* Experience Section */}
      <section
        id="experience"
        className="py-20 px-6 md:px-12 relative overflow-hidden"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <p className="text-accent text-sm md:text-base mb-2 tracking-widest uppercase font-medium">
              {t("WORK EXPERIENCE", "EXPÉRIENCE PROFESSIONNELLE")}
            </p>
            <h3 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              {t("Professional", "Parcours")}{" "}
              <span className="gradient-text">
                {t("Journey", "Professionnel")}
              </span>
            </h3>
          </motion.div>
          {data.experiences.length > 0 ? (
            <div className="space-y-8">
              {data.experiences.map((exp) => (
                <ExperienceCard key={exp.id} experience={exp} lang={lang} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground text-lg">
              {t(
                "No work experience added yet",
                "Aucune expérience professionnelle ajoutée",
              )}
            </p>
          )}
        </div>
      </section>

      {/* Education Section */}
      <section
        id="education"
        className="py-20 px-6 md:px-12 bg-muted/30 relative overflow-hidden"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <p className="text-accent text-sm md:text-base mb-2 tracking-widest uppercase font-medium">
              {t("EDUCATION", "FORMATION")}
            </p>
            <h3 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              {t("Academic", "Parcours")}{" "}
              <span className="gradient-text">
                {t("Background", "Académique")}
              </span>
            </h3>
          </motion.div>
          {data.education.length > 0 ? (
            <div className="space-y-8">
              {data.education.map((edu) => (
                <EducationCard key={edu.id} education={edu} lang={lang} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground text-lg">
              {t("No education history added yet", "Aucune formation ajoutée")}
            </p>
          )}
        </div>
      </section>

      {/* Hobbies & Interests Section */}
      <section
        id="hobbies"
        className="py-20 px-6 md:px-12 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <p className="text-accent text-sm md:text-base mb-2 tracking-widest uppercase font-medium">
              {t("HOBBIES & INTERESTS", "LOISIRS ET INTÉRÊTS")}
            </p>
            <h3 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              {t("Beyond", "Au-delà du")}{" "}
              <span className="gradient-text">{t("Work", "Travail")}</span>
            </h3>
          </motion.div>
          {data.hobbies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.hobbies.map((hobby) => (
                <HobbyCard key={hobby.id} hobby={hobby} lang={lang} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground text-lg">
              {t("No hobbies added yet", "Aucun loisir ajouté")}
            </p>
          )}
        </div>
      </section>

      {/* Resume Download Section - Always Visible */}
      <section
        id="resume"
        className="py-20 px-6 md:px-12 bg-muted/30 relative overflow-hidden"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <p className="text-accent text-sm md:text-base mb-2 tracking-widest uppercase font-medium">
              {t("RESUME", "CV")}
            </p>
            <h3 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              {t("Download My", "Télécharger mon")}{" "}
              <span className="gradient-text">{t("Resume", "CV")}</span>
            </h3>
          </motion.div>
          {data.resume ? (
            // Resume Available - Download Card
            <div className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border-2 border-blue-500/30 rounded-2xl p-12 text-center relative overflow-hidden group hover:border-purple-500/50 transition-all duration-500">
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/5 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mb-6 shadow-lg shadow-blue-500/50 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-10 h-10 text-white" />
                </div>

                <h3 className="text-3xl font-bold text-white mb-3 gradient-text">
                  {t("Download My Resume", "Télécharger mon CV")}
                </h3>

                <p className="text-gray-300 mb-2 text-lg font-medium">
                  {data.resume.filename}
                </p>

                <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                  {t(
                    "Get a comprehensive overview of my experience, skills, and qualifications",
                    "Obtenez un aperçu complet de mon expérience, mes compétences et qualifications",
                  )}
                </p>

                <a
                  href={data.resume.fileUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-purple-500/40 transform hover:scale-105 group"
                >
                  <Download className="w-6 h-6 group-hover:animate-bounce" />
                  {t("Download Resume", "Télécharger le CV")}
                </a>

                <p className="text-xs text-gray-500 mt-4">
                  {t(
                    "PDF Format • Last Updated",
                    "Format PDF • Dernière mise à jour",
                  )}{" "}
                  {new Date(data.resume.createdAt).toLocaleDateString(
                    lang === "en" ? "en-US" : "fr-FR",
                  )}
                </p>
              </div>
            </div>
          ) : (
            // No Resume Available - Placeholder Card
            <div className="bg-gradient-to-br from-gray-900/50 via-gray-800/50 to-gray-900/50 border-2 border-gray-700/50 rounded-2xl p-12 text-center relative overflow-hidden">
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-800 rounded-full mb-6 opacity-50">
                  <FileText className="w-10 h-10 text-gray-600" />
                </div>

                <h3 className="text-3xl font-bold text-gray-400 mb-3">
                  {t("Resume Coming Soon", "CV Bientôt Disponible")}
                </h3>

                <p className="text-gray-500 mb-8 max-w-2xl mx-auto">
                  {t(
                    "My professional resume will be available for download here soon. Stay tuned!",
                    "Mon CV professionnel sera bientôt disponible en téléchargement ici. Restez à l'écoute!",
                  )}
                </p>

                <button
                  disabled
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gray-800 text-gray-500 text-lg font-semibold rounded-lg cursor-not-allowed opacity-50"
                >
                  <FileText className="w-6 h-6" />
                  {t("No Resume Available", "CV Non Disponible")}
                </button>

                <p className="text-xs text-gray-600 mt-4">
                  {t(
                    "Check back later for updates",
                    "Revenez plus tard pour les mises à jour",
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      {data.testimonials.length > 0 && (
        <section id="testimonials" className="py-20 bg-black overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
            <h3 className="text-4xl font-bold text-center text-white mb-4 gradient-text">
              {t("Testimonials", "Témoignages")}
            </h3>
          </div>

          {/* Horizontal Scrolling Container */}
          <div className="relative">
            <div className="flex gap-6 animate-scroll-left hover:pause-animation">
              {/* Duplicate testimonials for seamless loop */}
              {[...data.testimonials, ...data.testimonials].map(
                (testimonial, index) => (
                  <div
                    key={`${testimonial.id}-${index}`}
                    className="flex-shrink-0 w-[400px]"
                  >
                    <TestimonialCard testimonial={testimonial} lang={lang} />
                  </div>
                ),
              )}
            </div>
          </div>
        </section>
      )}

      {/* Submit Testimonial Section */}
      <section
        id="submit-testimonial"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-black"
      >
        <div className="max-w-3xl mx-auto">
          <h3 className="text-4xl font-bold text-center text-white mb-4 gradient-text">
            {t("Share Your Experience", "Partagez votre expérience")}
          </h3>
          <p className="text-center text-gray-400 mb-12">
            {t(
              "Have you worked with me? I'd love to hear your feedback!",
              "Avez-vous travaillé avec moi ? J'aimerais connaître votre avis !",
            )}
          </p>
          <TestimonialForm lang={lang} t={t} />
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="py-20 px-6 md:px-12 relative overflow-hidden"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <p className="text-accent text-sm md:text-base mb-2 tracking-widest uppercase font-medium">
              {t("GET IN TOUCH", "CONTACTEZ-MOI")}
            </p>
            <h3 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              {t("Let's", "Parlons de")}{" "}
              <span className="gradient-text">{t("Talk", "votre Projet")}</span>
            </h3>
          </motion.div>
          <ContactForm lang={lang} t={t} />

          {/* Contact Information - Centered Cards */}
          {data.contactInfo.length > 0 && (
            <div className="mt-16 space-y-8">
              <div className="flex flex-wrap justify-center gap-8">
                {data.contactInfo.map((info) => {
                  const getValue = (val: any) => {
                    if (typeof val === "object" && val !== null) {
                      return val[lang] || val.en || "";
                    }
                    return val || "";
                  };

                  const value = getValue(info.value);

                  // Skip email here - it will be shown in the large button below
                  if (info.type === "email") {
                    return null;
                  }

                  // Render Location
                  if (info.type === "address" && value) {
                    return (
                      <motion.div
                        key={info.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-col items-center text-center"
                      >
                        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-3">
                          <MapPin className="w-7 h-7 text-accent" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {t("Location", "Localisation")}
                        </p>
                        <p className="text-foreground font-medium">{value}</p>
                      </motion.div>
                    );
                  }

                  return null;
                })}
              </div>

              {/* Large Email Button */}
              {data.contactInfo.find((info) => info.type === "email") && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="flex justify-center"
                >
                  <a
                    href={`mailto:${(() => {
                      const emailInfo = data.contactInfo.find(
                        (info) => info.type === "email",
                      );
                      if (!emailInfo) return "";
                      const val = emailInfo.value;
                      if (typeof val === "object" && val !== null) {
                        return val[lang] || val.en || "";
                      }
                      return val || "";
                    })()}`}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-background rounded-full font-medium hover:bg-accent/90 transition-all hover:shadow-lg"
                  >
                    {(() => {
                      const emailInfo = data.contactInfo.find(
                        (info) => info.type === "email",
                      );
                      if (!emailInfo) return "";
                      const val = emailInfo.value;
                      if (typeof val === "object" && val !== null) {
                        return val[lang] || val.en || "";
                      }
                      return val || "";
                    })()}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </motion.div>
              )}

              {/* Social Links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex justify-center gap-6"
              >
                {data.contactInfo.map((info) => {
                  const getValue = (val: any) => {
                    if (typeof val === "object" && val !== null) {
                      return val[lang] || val.en || "";
                    }
                    return val || "";
                  };

                  const value = getValue(info.value);

                  if (info.type === "social_links" && value) {
                    const isLinkedIn = value.toLowerCase().includes("linkedin");
                    const isGitHub = value.toLowerCase().includes("github");
                    const isTwitter =
                      value.toLowerCase().includes("twitter") ||
                      value.toLowerCase().includes("x.com");

                    const Icon = isLinkedIn
                      ? Linkedin
                      : isGitHub
                        ? Github
                        : LinkIcon;
                    const label = isLinkedIn
                      ? "LinkedIn"
                      : isGitHub
                        ? "GitHub"
                        : isTwitter
                          ? "Twitter"
                          : "Link";

                    return (
                      <a
                        key={info.id}
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors"
                        aria-label={label}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm">{label}</span>
                      </a>
                    );
                  }

                  return null;
                })}
              </motion.div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border text-muted-foreground py-8 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm">
            &copy; 2026 Portfolio.{" "}
            {t("All rights reserved.", "Tous droits réservés.")}
          </p>
        </div>
      </footer>
    </div>
  );
}

function ProjectCard({
  project,
  lang,
}: {
  project: Project;
  lang: "en" | "fr";
}) {
  const getTitle = () => {
    if (typeof project.title === "object" && project.title !== null) {
      return project.title[lang] || project.title.en || "Untitled Project";
    }
    return project.title || "Untitled Project";
  };

  const getDescription = () => {
    if (
      typeof project.description === "object" &&
      project.description !== null
    ) {
      return project.description[lang] || project.description.en || "";
    }
    return project.description || "";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="bg-card rounded-xl border border-border overflow-hidden hover:border-accent/50 transition-all hover:shadow-xl hover:shadow-accent/10 group"
    >
      {project.imageUrl && (
        <div className="h-56 bg-muted relative overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.imageUrl}
            alt={getTitle()}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      )}
      <div className="p-6">
        <h4 className="text-xl font-bold text-foreground mb-2 group-hover:text-accent transition-colors font-display">
          {getTitle()}
        </h4>
        <p className="text-muted-foreground mb-4 line-clamp-2 text-sm leading-relaxed">
          {getDescription()}
        </p>
        {project.technologies && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.technologies.slice(0, 3).map((tech, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-accent/10 text-accent rounded-md text-xs font-medium border border-accent/20"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-3">
          {project.projectUrl && (
            <a
              href={project.projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-accent hover:text-accent-secondary text-sm font-medium transition-colors"
            >
              <ExternalLink size={14} />
              {lang === "en" ? "View" : "Voir"}
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              <Github size={14} />
              Code
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function SkillsGrid({ skills, lang }: { skills: Skill[]; lang: "en" | "fr" }) {
  if (skills.length === 0) {
    return (
      <p className="text-center text-muted-foreground text-lg">
        {lang === "en" ? "No skills added yet" : "Aucune compétence ajoutée"}
      </p>
    );
  }

  const grouped = skills.reduce(
    (acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = [];
      acc[skill.category].push(skill);
      return acc;
    },
    {} as Record<string, Skill[]>,
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Object.entries(grouped).map(([category, categorySkills], index) => (
        <motion.div
          key={category}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="bg-card border border-border rounded-xl p-6 hover:border-accent/50 transition-all hover:shadow-lg group"
        >
          <h4 className="text-lg font-bold mb-4 text-foreground font-display group-hover:text-accent transition-colors">
            {category}
          </h4>
          <div className="space-y-3">
            {categorySkills.map((skill) => {
              const skillName =
                typeof skill.name === "object" && skill.name !== null
                  ? skill.name[lang]
                  : skill.name;
              const skillLevel = skill.level || 85; // Use skill level or default to 85
              return (
                <div key={skill.id}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <SkillIcon skillName={skillName} className="w-5 h-5" />
                      <span className="text-sm font-medium text-foreground">
                        {skillName}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {skillLevel}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skillLevel}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                      className="h-full bg-gradient-to-r from-accent to-accent-secondary rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ExperienceCard({
  experience,
  lang,
}: {
  experience: WorkExperience;
  lang: "en" | "fr";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative pl-8 pb-8 border-l-2 border-accent/30 hover:border-accent transition-colors group"
    >
      <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-accent border-4 border-background group-hover:scale-125 transition-transform"></div>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-2">
        <div>
          <h4 className="text-xl font-bold text-foreground font-display group-hover:text-accent transition-colors">
            {experience.position[lang]}
          </h4>
          <p className="text-accent-secondary font-medium">
            {experience.company[lang]}
          </p>
          <p className="text-sm text-muted-foreground">
            {experience.location[lang]}
          </p>
        </div>
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {experience.startDate} -{" "}
          {experience.current
            ? lang === "en"
              ? "Present"
              : "Présent"
            : experience.endDate}
        </span>
      </div>
      <p className="text-muted-foreground mt-3 leading-relaxed">
        {experience.description[lang]}
      </p>
    </motion.div>
  );
}

function EducationCard({
  education,
  lang,
}: {
  education: Education;
  lang: "en" | "fr";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-card border border-border rounded-xl p-6 hover:border-accent/50 transition-all hover:shadow-lg group"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <h4 className="text-xl font-bold text-foreground font-display group-hover:text-accent transition-colors">
            {education.degree[lang]}
          </h4>
          <p className="text-accent-secondary font-medium mt-1">
            {education.institution[lang]}
          </p>
          <p className="text-sm text-muted-foreground">
            {education.location[lang]}
          </p>
        </div>
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {education.startDate} -{" "}
          {education.endDate || (lang === "en" ? "Present" : "Présent")}
        </span>
      </div>
      {education.description && (
        <p className="text-muted-foreground mt-3 leading-relaxed text-sm">
          {education.description[lang]}
        </p>
      )}
      {education.gpa && (
        <div className="mt-3 inline-block px-3 py-1 bg-accent/10 text-accent rounded-md text-sm font-medium border border-accent/20">
          GPA: {education.gpa}
        </div>
      )}
    </motion.div>
  );
}

function HobbyCard({ hobby, lang }: { hobby: Hobby; lang: "en" | "fr" }) {
  return (
    <div
      className="bg-gray-900 rounded-lg border border-gray-800 p-6 hover:border-pink-500 transition-all hover:shadow-lg hover:shadow-pink-500/20 animate-scale-in group overflow-hidden relative"
      style={{ backgroundColor: hobby.color ? `${hobby.color}10` : undefined }}
    >
      {hobby.imageUrl && (
        <div className="w-full h-48 mb-4 rounded-lg overflow-hidden">
          <img
            src={hobby.imageUrl}
            alt={hobby.title[lang]}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
      )}
      <h4 className="text-xl font-bold text-white group-hover:text-pink-400 transition-colors">
        {hobby.title[lang]}
      </h4>
      {hobby.description && (
        <p className="text-sm text-gray-300 mt-3">{hobby.description[lang]}</p>
      )}
    </div>
  );
}

function TestimonialCard({
  testimonial,
  lang,
}: {
  testimonial: Testimonial;
  lang: "en" | "fr";
}) {
  const getMessage = () => {
    if (
      typeof testimonial.message === "object" &&
      testimonial.message !== null
    ) {
      return testimonial.message[lang] || testimonial.message.en;
    }
    // Legacy format - just return the string
    return testimonial.message as string;
  };

  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border p-6 hover:border-accent transition-all hover:shadow-lg hover:shadow-accent/20 group h-full flex flex-col">
      <div className="flex mb-3">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={20}
            className={
              i < testimonial.rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-muted-foreground/30"
            }
          />
        ))}
      </div>
      <p className="text-foreground/90 mb-4 italic flex-grow line-clamp-4">
        &quot;{getMessage()}&quot;
      </p>
      <div className="mt-auto">
        <p className="font-semibold text-foreground">{testimonial.name}</p>
        <p className="text-sm text-accent">{testimonial.position}</p>
        {testimonial.company && (
          <p className="text-sm text-muted-foreground">{testimonial.company}</p>
        )}
      </div>
    </div>
  );
}

function ContactInfoCard({
  info,
  lang,
}: {
  info: ContactInfo;
  lang: "en" | "fr";
}) {
  const getIcon = (type: string) => {
    switch (type) {
      case "email":
        return Mail;
      case "phone":
        return Phone;
      case "address":
        return MapPin;
      default:
        return LinkIcon;
    }
  };

  const Icon = getIcon(info.type);

  const getValue = () => {
    if (typeof info.value === "object" && info.value !== null) {
      return info.value[lang] || info.value.en || "";
    }
    return info.value || "";
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 text-center hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/20 transform hover:scale-105">
      <Icon className="w-8 h-8 mx-auto mb-2 text-blue-400" />
      <p className="text-gray-300 font-medium">{getValue()}</p>
    </div>
  );
}

function TestimonialForm({
  lang,
  t,
}: {
  lang: "en" | "fr";
  t: (en: string, fr: string) => string;
}) {
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    company: "",
    email: "",
    message: "",
    rating: 0,
  });
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await apiClient.submitTestimonial({
        name: formData.name,
        position: formData.position,
        company: formData.company || undefined,
        email: formData.email,
        message: { en: formData.message, fr: formData.message },
        rating: formData.rating,
      });
      setStatus("success");
      setFormData({
        name: "",
        position: "",
        company: "",
        email: "",
        message: "",
        rating: 0,
      });
      setTimeout(() => setStatus("idle"), 5000);
    } catch (error) {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border p-8 shadow-2xl"
    >
      {status === "success" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl"
        >
          <p className="text-green-400 text-center font-medium flex items-center justify-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            {t(
              "Thank you! Your testimonial has been submitted and will be reviewed shortly.",
              "Merci ! Votre témoignage a été soumis et sera examiné prochainement.",
            )}
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            {t("Your Name", "Votre nom")} <span className="text-accent">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-foreground placeholder-muted-foreground"
            placeholder={t("John Doe", "Jean Dupont")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            {t("Email", "Email")} <span className="text-accent">*</span>
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-foreground placeholder-muted-foreground"
            placeholder="john@example.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            {t("Position", "Poste")} <span className="text-accent">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.position}
            onChange={(e) =>
              setFormData({ ...formData, position: e.target.value })
            }
            className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-foreground placeholder-muted-foreground"
            placeholder={t("Software Engineer", "Ingénieur logiciel")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            {t("Company (Optional)", "Entreprise (Optionnel)")}
          </label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) =>
              setFormData({ ...formData, company: e.target.value })
            }
            className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-foreground placeholder-muted-foreground"
            placeholder={t("Tech Corp", "Tech Corp")}
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground/80 mb-3">
          {t("Rating", "Note")} <span className="text-accent">*</span>
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFormData({ ...formData, rating: star })}
              className="transition-all focus:outline-none hover:scale-110 transform"
            >
              <Star
                size={32}
                className={
                  star <= formData.rating
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-muted-foreground/30"
                }
              />
            </button>
          ))}
          <span className="ml-3 text-foreground/70 font-medium">
            {formData.rating} / 5
          </span>
        </div>
        {formData.rating === 0 && (
          <p className="mt-2 text-sm text-muted-foreground">
            {t("Please select a rating", "Veuillez sélectionner une note")}
          </p>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground/80 mb-3">
          {t("Your Testimonial", "Votre témoignage")}{" "}
          <span className="text-accent">*</span>
        </label>
        <textarea
          required
          rows={6}
          value={formData.message}
          onChange={(e) =>
            setFormData({ ...formData, message: e.target.value })
          }
          className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-foreground placeholder-muted-foreground resize-none"
          placeholder={t(
            "Share your experience working with me...",
            "Partagez votre expérience de travail avec moi..."
          )}
        />
      </div>

      <button
        type="submit"
        disabled={
          status === "sending" ||
          status === "success" ||
          formData.rating === 0 ||
          !formData.message
        }
        className="w-full px-8 py-4 bg-gradient-to-r from-accent to-accent/80 text-background rounded-xl hover:shadow-xl hover:shadow-accent/30 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {status === "sending"
          ? t("Submitting...", "Envoi en cours...")
          : status === "success"
            ? t("Submitted Successfully!", "Soumis avec succès !")
            : status === "error"
              ? t("Error, try again", "Erreur, réessayez")
              : t("Submit Testimonial", "Soumettre le témoignage")}
      </button>

      {status !== "success" && (
        <p className="mt-4 text-sm text-muted-foreground text-center">
          {t(
            "Your testimonial will be reviewed before being published.",
            "Votre témoignage sera examiné avant d'être publié.",
          )}
        </p>
      )}
    </motion.form>
  );
}

function ContactForm({
  lang,
  t,
}: {
  lang: "en" | "fr";
  t: (en: string, fr: string) => string;
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await apiClient.sendMessage(formData);
      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setStatus("idle"), 5000);
    } catch (error) {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border p-8 shadow-2xl"
    >
      {status === "success" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl"
        >
          <p className="text-green-400 text-center font-medium flex items-center justify-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            {t(
              "Thank you! Your message has been sent successfully. I'll get back to you soon!",
              "Merci ! Votre message a été envoyé avec succès. Je vous répondrai bientôt !",
            )}
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            {t("Name", "Nom")} <span className="text-accent">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-foreground placeholder-muted-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            {t("Email", "Email")} <span className="text-accent">*</span>
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-foreground placeholder-muted-foreground"
          />
        </div>
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground/80 mb-2">
          {t("Subject", "Sujet")} <span className="text-accent">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.subject}
          onChange={(e) =>
            setFormData({ ...formData, subject: e.target.value })
          }
          className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-foreground placeholder-muted-foreground"
        />
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground/80 mb-2">
          {t("Message", "Message")} <span className="text-accent">*</span>
        </label>
        <textarea
          required
          rows={5}
          value={formData.message}
          onChange={(e) =>
            setFormData({ ...formData, message: e.target.value })
          }
          className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-foreground placeholder-muted-foreground resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={status === "sending" || status === "success"}
        className="w-full px-8 py-4 bg-gradient-to-r from-accent to-accent/80 text-background rounded-xl hover:shadow-xl hover:shadow-accent/30 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {status === "sending"
          ? t("Sending...", "Envoi...")
          : status === "success"
            ? t("Message sent!", "Message envoyé!")
            : status === "error"
              ? t("Error, try again", "Erreur, réessayez")
              : t("Send Message", "Envoyer")}
      </button>
    </motion.form>
  );
}
