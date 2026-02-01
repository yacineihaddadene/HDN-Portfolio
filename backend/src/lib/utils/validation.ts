import { z } from 'zod';

export const skillSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  proficiency: z.number().min(0).max(100).default(50),
  icon: z.string().optional(),
});

export const projectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  longDescription: z.string().optional(),
  technologies: z.array(z.string()),
  imageUrl: z.string().optional(),
  projectUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  featured: z.boolean().default(false),
  displayOrder: z.number().default(0),
});

export const experienceSchema = z.object({
  company: z.string().min(1, 'Company is required'),
  position: z.string().min(1, 'Position is required'),
  location: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().optional(),
  responsibilities: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
  displayOrder: z.number().default(0),
});

export const educationSchema = z.object({
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().min(1, 'Degree is required'),
  field: z.string().min(1, 'Field is required'),
  location: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.array(z.string()).optional(),
  gpa: z.string().optional(),
  honors: z.array(z.string()).optional(),
  displayOrder: z.number().default(0),
});

export const hobbySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  icon: z.string().optional(),
  imageUrl: z.string().optional(),
  displayOrder: z.number().default(0),
});

export const testimonialSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  position: z.string().optional(),
  company: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  rating: z.number().min(1).max(5).default(5),
  imageUrl: z.string().optional(),
  approved: z.boolean().default(false),
  featured: z.boolean().default(false),
  displayOrder: z.number().default(0),
});

export const resumeSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileUrl: z.string().min(1, 'File URL is required'),
  version: z.string().default('1.0'),
  language: z.string().default('en'),
  current: z.boolean().default(true),
});

export const contactInfoSchema = z.object({
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  twitter: z.string().optional(),
  website: z.string().optional(),
});

export const messageSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  subject: z.string().optional(),
  message: z.string().min(1, 'Message is required'),
});
