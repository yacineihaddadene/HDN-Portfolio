import { db } from '@/lib/db';
import {
  skills,
  projects,
  workExperience,
  education,
  hobbies,
  testimonials,
  resume,
  contactInfo,
} from '@/lib/db/schema';

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // Seed skills
    console.log('📝 Seeding skills...');
    await db.insert(skills).values([
      { name: 'JavaScript', category: 'Programming', proficiency: 90, icon: 'js' },
      { name: 'TypeScript', category: 'Programming', proficiency: 85, icon: 'ts' },
      { name: 'React', category: 'Framework', proficiency: 90, icon: 'react' },
      { name: 'Next.js', category: 'Framework', proficiency: 85, icon: 'nextjs' },
      { name: 'Node.js', category: 'Backend', proficiency: 80, icon: 'nodejs' },
      { name: 'PostgreSQL', category: 'Database', proficiency: 75, icon: 'postgresql' },
    ]);

    // Seed projects
    console.log('📝 Seeding projects...');
    await db.insert(projects).values([
      {
        title: 'Portfolio Website',
        description: 'A modern portfolio website built with Next.js',
        longDescription: 'A full-stack portfolio application with authentication, admin dashboard, and dynamic content management.',
        technologies: ['Next.js', 'TypeScript', 'PostgreSQL', 'Docker'],
        featured: true,
        displayOrder: 1,
      },
      {
        title: 'E-commerce Platform',
        description: 'Full-featured e-commerce platform',
        technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
        featured: true,
        displayOrder: 2,
      },
    ]);

    // Seed work experience
    console.log('📝 Seeding work experience...');
    await db.insert(workExperience).values([
      {
        company: 'Tech Company',
        position: 'Senior Full Stack Developer',
        location: 'Remote',
        startDate: '2022-01',
        current: true,
        description: 'Leading development of modern web applications',
        responsibilities: [
          'Architecting and developing scalable web applications',
          'Mentoring junior developers',
          'Code reviews and technical documentation',
        ],
        technologies: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
        displayOrder: 1,
      },
    ]);

    // Seed education
    console.log('📝 Seeding education...');
    await db.insert(education).values([
      {
        institution: 'University of Technology',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        location: 'City, Country',
        startDate: '2018-09',
        endDate: '2022-06',
        description: ['Focused on software engineering and web development', 'Graduated with honors'],
        gpa: '3.8',
        displayOrder: 1,
      },
    ]);

    // Seed hobbies
    console.log('📝 Seeding hobbies...');
    await db.insert(hobbies).values([
      {
        title: 'Photography',
        description: 'Capturing moments through landscape and street photography',
        icon: 'camera',
        displayOrder: 1,
      },
      {
        title: 'Open Source',
        description: 'Contributing to open source projects and building developer tools',
        icon: 'code',
        displayOrder: 2,
      },
    ]);

    // Seed testimonials
    console.log('📝 Seeding testimonials...');
    await db.insert(testimonials).values([
      {
        name: 'John Doe',
        position: 'CTO',
        company: 'Tech Startup',
        content: 'Excellent work on our project. Highly professional and skilled developer.',
        rating: 5,
        approved: true,
        featured: true,
        displayOrder: 1,
      },
    ]);

    // Seed contact info
    console.log('📝 Seeding contact info...');
    await db.insert(contactInfo).values([
      {
        email: 'contact@portfolio.com',
        phone: '+1 (555) 123-4567',
        location: 'City, Country',
        github: 'https://github.com/username',
        linkedin: 'https://linkedin.com/in/username',
      },
    ]);

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log('Seeding finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
