import { db, skills, projects, workExperience, education, hobbies, testimonials, contactInfo } from "../lib/db";

async function seed() {
  try {
    console.log("Starting database seed...");

    // Skip if database was already seeded (e.g. volume persisted across restarts)
    const existing = await db.select().from(skills).limit(1);
    if (existing.length > 0) {
      console.log("Database already has data, skipping seed to avoid duplicates.");
      return;
    }

    // Seed Skills
    console.log("Seeding skills...");
    const skillsData = [
      { name: { en: "Programming Language A", fr: "Langage de Programmation A" }, category: "Languages", order: 1 },
      { name: { en: "Programming Language B", fr: "Langage de Programmation B" }, category: "Languages", order: 2 },
      { name: { en: "Programming Language C", fr: "Langage de Programmation C" }, category: "Languages", order: 3 },
      { name: { en: "Framework X", fr: "Framework X" }, category: "Frontend", order: 4 },
      { name: { en: "Framework Y", fr: "Framework Y" }, category: "Frontend", order: 5 },
      { name: { en: "Framework Z", fr: "Framework Z" }, category: "Frontend", order: 6 },
      { name: { en: "Backend Tool A", fr: "Outil Backend A" }, category: "Backend", order: 7 },
      { name: { en: "Backend Tool B", fr: "Outil Backend B" }, category: "Backend", order: 8 },
      { name: { en: "Database System 1", fr: "Système de Base de Données 1" }, category: "Database", order: 9 },
      { name: { en: "Database System 2", fr: "Système de Base de Données 2" }, category: "Database", order: 10 },
      { name: { en: "DevOps Tool Alpha", fr: "Outil DevOps Alpha" }, category: "DevOps", order: 11 },
      { name: { en: "DevOps Tool Beta", fr: "Outil DevOps Beta" }, category: "DevOps", order: 12 },
    ];

    for (const skill of skillsData) {
      try {
        await db.insert(skills).values(skill);
      } catch (error) {
        // Skip if already exists
        console.log(`Skill ${skill.name.en} already exists, skipping...`);
      }
    }

    // Seed Projects
    console.log("Seeding projects...");
    const projectsData = [
      {
        title: { en: "Sample Project One", fr: "Projet Exemple Un" },
        description: { 
          en: "This is a demo project description", 
          fr: "Ceci est une description de projet de démonstration" 
        },
        fullDescription: {
          en: "This is a longer description for the first sample project. It demonstrates the structure of project data.",
          fr: "Ceci est une description plus longue pour le premier projet exemple. Il démontre la structure des données de projet."
        },
        technologies: ["Tech A", "Tech B", "Tech C"],
        color: "#FF5733",
        status: "published",
        featured: true,
      },
      {
        title: { en: "Sample Project Two", fr: "Projet Exemple Deux" },
        description: { 
          en: "Another example project for testing", 
          fr: "Un autre projet exemple pour les tests" 
        },
        fullDescription: {
          en: "This project shows how multiple projects can be stored with bilingual support and various technologies.",
          fr: "Ce projet montre comment plusieurs projets peuvent être stockés avec support bilingue et diverses technologies."
        },
        technologies: ["Tool X", "Tool Y", "Tool Z"],
        color: "#33C3FF",
        status: "published",
        featured: true,
      },
      {
        title: { en: "Demo Project Three", fr: "Projet Démo Trois" },
        description: { 
          en: "Third test project entry", 
          fr: "Troisième entrée de projet test" 
        },
        fullDescription: {
          en: "A demo project entry showcasing the data structure and bilingual content capability.",
          fr: "Une entrée de projet démo présentant la structure des données et la capacité de contenu bilingue."
        },
        technologies: ["Framework 1", "Framework 2"],
        color: "#8B33FF",
        status: "published",
        featured: false,
      },
    ];

    for (const project of projectsData) {
      try {
        await db.insert(projects).values(project);
      } catch (error) {
        console.log(`Project ${project.title.en} already exists, skipping...`);
      }
    }

    // Seed Work Experience
    console.log("Seeding work experience...");
    const experienceData = [
      {
        position: { en: "Software Developer", fr: "Développeur Logiciel" },
        company: { en: "Example Company Inc", fr: "Compagnie Exemple Inc" },
        location: { en: "City, State", fr: "Ville, État" },
        description: {
          en: "Worked on various software projects\nCollaborated with team members\nWrote and maintained code\nParticipated in meetings and planning",
          fr: "Travaillé sur divers projets logiciels\nCollaboré avec les membres de l'équipe\nÉcrit et maintenu du code\nParticipé aux réunions et à la planification",
        },
        startDate: "2023-01-01",
        endDate: null,
        current: true,
        order: 1,
      },
      {
        position: { en: "Junior Developer", fr: "Développeur Junior" },
        company: { en: "Demo Corporation", fr: "Société Démo" },
        location: { en: "Another City", fr: "Une Autre Ville" },
        description: {
          en: "Assisted in development tasks\nLearned new technologies\nFixed bugs and issues\nWorked on team projects",
          fr: "Assisté dans les tâches de développement\nAppris de nouvelles technologies\nCorrigé des bugs et problèmes\nTravaillé sur des projets d'équipe",
        },
        startDate: "2021-06-01",
        endDate: "2022-12-31",
        current: false,
        order: 2,
      },
    ];

    for (const exp of experienceData) {
      try {
        await db.insert(workExperience).values(exp);
      } catch (error) {
        console.log(`Experience already exists, skipping...`);
      }
    }

    // Seed Education
    console.log("Seeding education...");
    const educationData = [
      {
        degree: { en: "Bachelor's Degree in Technology", fr: "Baccalauréat en Technologie" },
        institution: { en: "Sample University", fr: "Université Exemple" },
        location: { en: "Some City", fr: "Une Ville" },
        description: {
          en: "General Technology Studies\nSoftware Development\nBasic Programming\nWeb Technologies",
          fr: "Études Technologiques Générales\nDéveloppement Logiciel\nProgrammation de Base\nTechnologies Web",
        },
        startDate: "2018-09-01",
        endDate: "2022-05-31",
        gpa: "3.5",
        order: 1,
      },
      {
        degree: { en: "Technology Certificate", fr: "Certificat en Technologie" },
        institution: { en: "Online Learning Platform", fr: "Plateforme d'Apprentissage en Ligne" },
        location: { en: "Online", fr: "En ligne" },
        description: {
          en: "Online Course Completion\nBasic Skills\nTechnology Fundamentals\nPractical Projects",
          fr: "Cours en Ligne Complété\nCompétences de Base\nFondamentaux Technologiques\nProjets Pratiques",
        },
        startDate: "2022-01-01",
        endDate: "2022-06-30",
        gpa: null,
        order: 2,
      },
    ];

    for (const edu of educationData) {
      try {
        await db.insert(education).values(edu);
      } catch (error) {
        console.log(`Education already exists, skipping...`);
      }
    }

    // Seed Hobbies
    console.log("Seeding hobbies...");
    const hobbiesData = [
      { title: { en: "Hobby One", fr: "Loisir Un" }, description: { en: "Enjoying various activities", fr: "Profiter de diverses activités" }, color: "#FF6B6B", order: 1 },
      { title: { en: "Hobby Two", fr: "Loisir Deux" }, description: { en: "Doing interesting things", fr: "Faire des choses intéressantes" }, color: "#4ECDC4", order: 2 },
      { title: { en: "Hobby Three", fr: "Loisir Trois" }, description: { en: "Spending free time productively", fr: "Passer du temps libre de manière productive" }, color: "#95E1D3", order: 3 },
      { title: { en: "Hobby Four", fr: "Loisir Quatre" }, description: { en: "Exploring new interests", fr: "Explorer de nouveaux intérêts" }, color: "#F38181", order: 4 },
    ];

    for (const hobby of hobbiesData) {
      try {
        await db.insert(hobbies).values(hobby);
      } catch (error) {
        console.log(`Hobby ${hobby.title.en} already exists, skipping...`);
      }
    }

    // Seed Testimonials
    console.log("Seeding testimonials...");
    const testimonialsData = [
      {
        name: "Person A",
        position: "Position Title",
        company: "Company Name One",
        email: "persona@example.com",
        message: "This is a sample testimonial message. It demonstrates the structure of testimonial data.",
        rating: 5,
        status: "approved",
      },
      {
        name: "Person B",
        position: "Job Title",
        company: "Company Name Two",
        email: "personb@example.com",
        message: "Another example testimonial showing how multiple testimonials can be stored in the database.",
        rating: 4,
        status: "approved",
      },
      {
        name: "Person C",
        position: "Work Title",
        company: "Company Name Three",
        email: "personc@example.com",
        message: "A third testimonial entry for demonstration purposes. This shows the variety of data that can be included.",
        rating: 5,
        status: "approved",
      },
    ];

    for (const testimonial of testimonialsData) {
      try {
        await db.insert(testimonials).values(testimonial);
      } catch (error) {
        console.log(`Testimonial already exists, skipping...`);
      }
    }

    // Seed Contact Info
    console.log("Seeding contact info...");
    const contactInfoData = [
      {
        type: "email",
        value: { en: "demo@example.com", fr: "demo@exemple.com" },
        order: 1,
      },
      {
        type: "phone",
        value: { en: "+1 (555) 000-0000", fr: "+33 1 23 45 67 89" },
        order: 2,
      },
      {
        type: "address",
        value: { en: "Sample City, ST, USA", fr: "Ville Exemple, France" },
        order: 3,
      },
    ];

    for (const info of contactInfoData) {
      try {
        await db.insert(contactInfo).values(info);
      } catch (error) {
        console.log(`Contact info already exists, skipping...`);
      }
    }

    console.log("Database seed completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    // Don't exit with error code - allow container to start even if seeding has issues
    // (e.g., data already exists from previous runs)
    console.log("Continuing despite seeding errors...");
  }
}

seed();
