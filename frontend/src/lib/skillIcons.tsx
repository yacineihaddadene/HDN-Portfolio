import React from "react";
import * as SimpleIcons from "simple-icons";

// Map of skill names to Simple Icons slugs
const skillIconMap: Record<string, string> = {
  // Programming Languages
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  java: "openjdk",
  "c++": "cplusplus",
  "c#": "csharp",
  php: "php",
  ruby: "ruby",
  go: "go",
  rust: "rust",
  swift: "swift",
  kotlin: "kotlin",
  dart: "dart",
  r: "r",
  scala: "scala",

  // Frontend Frameworks/Libraries
  react: "react",
  vue: "vuedotjs",
  angular: "angular",
  svelte: "svelte",
  "next.js": "nextdotjs",
  nextjs: "nextdotjs",
  nuxt: "nuxtdotjs",
  gatsby: "gatsby",

  // Backend Frameworks
  "node.js": "nodedotjs",
  nodejs: "nodedotjs",
  express: "express",
  fastapi: "fastapi",
  django: "django",
  flask: "flask",
  spring: "spring",
  laravel: "laravel",

  // Databases
  mongodb: "mongodb",
  mysql: "mysql",
  postgresql: "postgresql",
  redis: "redis",
  sqlite: "sqlite",
  firebase: "firebase",
  supabase: "supabase",

  // DevOps & Tools
  docker: "docker",
  kubernetes: "kubernetes",
  git: "git",
  github: "github",
  gitlab: "gitlab",
  jenkins: "jenkins",
  nginx: "nginx",
  aws: "amazonaws",
  azure: "microsoftazure",
  gcp: "googlecloud",

  // UI/Design
  figma: "figma",
  sketch: "sketch",
  "adobe xd": "adobexd",
  photoshop: "adobephotoshop",
  illustrator: "adobeillustrator",

  // Testing
  jest: "jest",
  cypress: "cypress",
  playwright: "playwright",
  vitest: "vitest",

  // Other
  tailwind: "tailwindcss",
  tailwindcss: "tailwindcss",
  sass: "sass",
  webpack: "webpack",
  vite: "vite",
  graphql: "graphql",
  redux: "redux",
};

interface SkillIconProps {
  skillName: string;
  className?: string;
}

export function getSkillIcon(skillName: string): string | null {
  const normalizedName = skillName.toLowerCase().trim();
  const iconSlug = skillIconMap[normalizedName];

  if (iconSlug) {
    const icon =
      SimpleIcons[
        `si${iconSlug.charAt(0).toUpperCase()}${iconSlug.slice(1)}` as keyof typeof SimpleIcons
      ];
    if (icon && "svg" in icon) {
      return icon.svg;
    }
  }

  return null;
}

export function SkillIcon({
  skillName,
  className = "w-6 h-6",
}: SkillIconProps) {
  const svg = getSkillIcon(skillName);

  if (!svg) {
    // Return a default icon if no match found
    return (
      <div
        className={`${className} rounded-full bg-accent/20 flex items-center justify-center`}
      >
        <span className="text-xs font-bold text-accent">
          {skillName.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`${className} skill-icon`}
      dangerouslySetInnerHTML={{ __html: svg }}
      style={{ 
        display: "inline-block",
        filter: "brightness(0) saturate(100%) invert(65%) sepia(88%) saturate(2547%) hue-rotate(223deg) brightness(102%) contrast(101%)"
      }}
    />
  );
}

export default SkillIcon;
