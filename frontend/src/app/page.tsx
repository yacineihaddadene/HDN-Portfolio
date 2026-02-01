'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';
import type { Project, Skill, WorkExperience, Education, Hobby, Testimonial, ContactInfo } from '@/lib/api/client';

export default function Home() {
  const [lang, setLang] = useState<'en' | 'fr'>('en');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    projects: [] as Project[],
    skills: [] as Skill[],
    experiences: [] as WorkExperience[],
    education: [] as Education[],
    hobbies: [] as Hobby[],
    testimonials: [] as Testimonial[],
    contactInfo: [] as ContactInfo[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [projects, skills, experiences, education, hobbies, testimonials, contactInfo] = await Promise.all([
        apiClient.getPublicProjects().catch((err) => {
          console.error('Failed to load projects:', err);
          return { projects: [] };
        }),
        apiClient.getPublicSkills().catch((err) => {
          console.error('Failed to load skills:', err);
          return { skills: [] };
        }),
        apiClient.getPublicExperience().catch((err) => {
          console.error('Failed to load experience:', err);
          return { experiences: [] };
        }),
        apiClient.getPublicEducation().catch((err) => {
          console.error('Failed to load education:', err);
          return { education: [] };
        }),
        apiClient.getPublicHobbies().catch((err) => {
          console.error('Failed to load hobbies:', err);
          return { hobbies: [] };
        }),
        apiClient.getPublicTestimonials().catch((err) => {
          console.error('Failed to load testimonials:', err);
          return { testimonials: [] };
        }),
        apiClient.getPublicContactInfo().catch((err) => {
          console.error('Failed to load contact info:', err);
          return { contactInfo: [] };
        }),
      ]);

      console.log('Loaded data:', {
        projects: projects.projects.length,
        skills: skills.skills.length,
        experiences: experiences.experiences.length,
        education: education.education.length,
        hobbies: hobbies.hobbies.length,
        testimonials: testimonials.testimonials.length,
        contactInfo: contactInfo.contactInfo.length,
      });

      setData({
        projects: projects.projects || [],
        skills: skills.skills || [],
        experiences: experiences.experiences || [],
        education: education.education || [],
        hobbies: hobbies.hobbies || [],
        testimonials: testimonials.testimonials || [],
        contactInfo: contactInfo.contactInfo || [],
      });
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const t = (en: string, fr: string) => lang === 'en' ? en : fr;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-sm shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Portfolio
            </h1>
            <div className="flex items-center gap-6">
              <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors">
                {t('About', 'À propos')}
              </a>
              <a href="#projects" className="text-gray-700 hover:text-blue-600 transition-colors">
                {t('Projects', 'Projets')}
              </a>
              <a href="#skills" className="text-gray-700 hover:text-blue-600 transition-colors">
                {t('Skills', 'Compétences')}
              </a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors">
                {t('Contact', 'Contact')}
              </a>
              <button
                onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}
                className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium hover:bg-blue-200 transition-colors"
              >
                {lang === 'en' ? 'FR' : 'EN'}
              </button>
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                {t('Admin', 'Admin')}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            {t('Welcome to My Portfolio', 'Bienvenue sur mon Portfolio')}
          </h2>
          <p className="text-xl text-gray-900 mb-8 max-w-2xl mx-auto">
            {t(
              'Explore my work, skills, and professional journey',
              'Découvrez mon travail, mes compétences et mon parcours professionnel'
            )}
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="#projects"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {t('View Projects', 'Voir les projets')}
            </a>
            <a
              href="#contact"
              className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              {t('Get in Touch', 'Me contacter')}
            </a>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-4xl font-bold text-center text-gray-900 mb-12">{t('Featured Projects', 'Projets en vedette')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.projects.slice(0, 6).map((project) => (
              <ProjectCard key={project.id} project={project} lang={lang} />
            ))}
          </div>
          {data.projects.length === 0 && (
            <p className="text-center text-gray-900 text-lg col-span-full">{t('No projects yet', 'Aucun projet pour le moment')}</p>
          )}
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-4xl font-bold text-center text-gray-900 mb-12">{t('Skills & Expertise', 'Compétences et expertise')}</h3>
          <SkillsGrid skills={data.skills} lang={lang} />
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-4xl font-bold text-center text-gray-900 mb-12">{t('Work Experience', 'Expérience professionnelle')}</h3>
          {data.experiences.length > 0 ? (
            <div className="space-y-8">
              {data.experiences.map((exp) => (
                <ExperienceCard key={exp.id} experience={exp} lang={lang} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-900 text-lg">
              {t('No work experience added yet', 'Aucune expérience professionnelle ajoutée')}
            </p>
          )}
        </div>
      </section>

      {/* Education Section */}
      <section id="education" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-4xl font-bold text-center text-gray-900 mb-12">{t('Education', 'Formation')}</h3>
          {data.education.length > 0 ? (
            <div className="space-y-8">
              {data.education.map((edu) => (
                <EducationCard key={edu.id} education={edu} lang={lang} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-900 text-lg">
              {t('No education history added yet', 'Aucune formation ajoutée')}
            </p>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      {data.testimonials.length > 0 && (
        <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-4xl font-bold text-center text-gray-900 mb-12">{t('Testimonials', 'Témoignages')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.testimonials.slice(0, 6).map((testimonial) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Submit Testimonial Section */}
      <section id="submit-testimonial" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-4xl font-bold text-center text-gray-900 mb-4">
            {t('Share Your Experience', 'Partagez votre expérience')}
          </h3>
          <p className="text-center text-gray-900 mb-12">
            {t(
              'Have you worked with me? I\'d love to hear your feedback!',
              'Avez-vous travaillé avec moi ? J\'aimerais connaître votre avis !'
            )}
          </p>
          <TestimonialForm lang={lang} t={t} />
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-4xl font-bold text-center text-gray-900 mb-12">{t('Get in Touch', 'Contactez-moi')}</h3>
          <ContactForm lang={lang} t={t} />
          {data.contactInfo.length > 0 && (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.contactInfo.map((info) => (
                <ContactInfoCard key={info.id} info={info} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p>&copy; 2026 Portfolio. {t('All rights reserved.', 'Tous droits réservés.')}</p>
        </div>
      </footer>
    </div>
  );
}

function ProjectCard({ project, lang }: { project: Project; lang: 'en' | 'fr' }) {
  const getTitle = () => {
    if (typeof project.title === 'object' && project.title !== null) {
      return project.title[lang] || project.title.en || 'Untitled Project';
    }
    return project.title || 'Untitled Project';
  };

  const getDescription = () => {
    if (typeof project.description === 'object' && project.description !== null) {
      return project.description[lang] || project.description.en || '';
    }
    return project.description || '';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {project.imageUrl && (
        <div className="h-48 bg-gradient-to-br from-blue-400 to-indigo-500">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={project.imageUrl} alt={getTitle()} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-6">
        <h4 className="text-xl font-bold text-gray-900 mb-2">{getTitle()}</h4>
        <p className="text-gray-900 mb-4 line-clamp-3">{getDescription()}</p>
        {project.technologies && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.technologies.slice(0, 3).map((tech, i) => (
              <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                {tech}
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-3">
          {project.projectUrl && (
            <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              {lang === 'en' ? 'View Project →' : 'Voir le projet →'}
            </a>
          )}
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-700 text-sm font-medium">
              GitHub →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function SkillsGrid({ skills, lang }: { skills: Skill[]; lang: 'en' | 'fr' }) {
  if (skills.length === 0) {
    return (
      <p className="text-center text-gray-900 text-lg">
        {lang === 'en' ? 'No skills added yet' : 'Aucune compétence ajoutée'}
      </p>
    );
  }

  const grouped = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Object.entries(grouped).map(([category, categorySkills]) => (
        <div key={category} className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-bold mb-4 text-gray-900">{category}</h4>
          <div className="flex flex-wrap gap-2">
            {categorySkills.map((skill) => (
              <span key={skill.id} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                {typeof skill.name === 'object' && skill.name !== null ? skill.name[lang] : skill.name}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ExperienceCard({ experience, lang }: { experience: WorkExperience; lang: 'en' | 'fr' }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
      <h4 className="text-xl font-bold text-gray-900">{experience.position[lang]}</h4>
      <p className="text-lg text-gray-900 mt-1">{experience.company[lang]}</p>
      <p className="text-sm text-gray-900 mt-1">{experience.location[lang]}</p>
      <p className="text-sm text-gray-900 mt-3">{experience.description[lang]}</p>
      <p className="text-sm text-gray-700 mt-3">
        {experience.startDate} - {experience.current ? (lang === 'en' ? 'Present' : 'Présent') : experience.endDate}
      </p>
    </div>
  );
}

function EducationCard({ education, lang }: { education: Education; lang: 'en' | 'fr' }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h4 className="text-xl font-bold text-gray-900">{education.degree[lang]}</h4>
      <p className="text-lg text-gray-900 mt-1">{education.institution[lang]}</p>
      <p className="text-sm text-gray-900 mt-1">{education.location[lang]}</p>
      {education.description && <p className="text-sm text-gray-900 mt-3">{education.description[lang]}</p>}
      <div className="flex gap-4 mt-3 text-sm text-gray-700">
        <span>{education.startDate} - {education.endDate || (lang === 'en' ? 'Present' : 'Présent')}</span>
        {education.gpa && <span>GPA: {education.gpa}</span>}
      </div>
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex mb-3">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
        ))}
      </div>
      <p className="text-gray-900 mb-4 italic">&quot;{testimonial.message}&quot;</p>
      <div>
        <p className="font-semibold text-gray-900">{testimonial.name}</p>
        <p className="text-sm text-gray-900">{testimonial.position}</p>
        {testimonial.company && <p className="text-sm text-gray-900">{testimonial.company}</p>}
      </div>
    </div>
  );
}

function ContactInfoCard({ info }: { info: ContactInfo }) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'email': return '📧';
      case 'phone': return '📱';
      case 'address': return '📍';
      default: return '🔗';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 text-center">
      <div className="text-3xl mb-2">{getIcon(info.type)}</div>
      <p className="text-gray-900 font-medium">{info.value}</p>
    </div>
  );
}

function TestimonialForm({ lang, t }: { lang: 'en' | 'fr'; t: (en: string, fr: string) => string }) {
  const [formData, setFormData] = useState({ 
    name: '', 
    position: '', 
    company: '', 
    email: '', 
    message: '', 
    rating: 5 
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await apiClient.submitTestimonial({
        name: formData.name,
        position: formData.position,
        company: formData.company || undefined,
        email: formData.email,
        message: formData.message,
        rating: formData.rating,
      });
      setStatus('success');
      setFormData({ name: '', position: '', company: '', email: '', message: '', rating: 5 });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
      {status === 'success' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-center font-medium">
            {t(
              '✓ Thank you! Your testimonial has been submitted and will be reviewed shortly.',
              '✓ Merci ! Votre témoignage a été soumis et sera examiné prochainement.'
            )}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            {t('Your Name', 'Votre nom')} *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
            placeholder={t('John Doe', 'Jean Dupont')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            {t('Email', 'Email')} *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
            placeholder="john@example.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            {t('Position', 'Poste')} *
          </label>
          <input
            type="text"
            required
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
            placeholder={t('Software Engineer', 'Ingénieur logiciel')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            {t('Company (Optional)', 'Entreprise (Optionnel)')}
          </label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
            placeholder={t('Tech Corp', 'Tech Corp')}
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-900 mb-2">
          {t('Rating', 'Note')} *
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFormData({ ...formData, rating: star })}
              className="text-3xl transition-colors focus:outline-none"
            >
              <span className={star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'}>
                ★
              </span>
            </button>
          ))}
          <span className="ml-2 text-gray-900 self-center">
            {formData.rating} / 5
          </span>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-900 mb-2">
          {t('Your Testimonial', 'Votre témoignage')} *
        </label>
        <textarea
          required
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
          placeholder={t(
            'Share your experience working with me...',
            'Partagez votre expérience de travail avec moi...'
          )}
        />
      </div>

      <button
        type="submit"
        disabled={status === 'sending' || status === 'success'}
        className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'sending' ? t('Submitting...', 'Envoi en cours...') : 
         status === 'success' ? t('Submitted Successfully!', 'Soumis avec succès !') :
         status === 'error' ? t('Error, try again', 'Erreur, réessayez') :
         t('Submit Testimonial', 'Soumettre le témoignage')}
      </button>

      {status !== 'success' && (
        <p className="mt-4 text-sm text-gray-900 text-center">
          {t(
            'Your testimonial will be reviewed before being published.',
            'Votre témoignage sera examiné avant d\'être publié.'
          )}
        </p>
      )}
    </form>
  );
}

function ContactForm({ lang, t }: { lang: 'en' | 'fr'; t: (en: string, fr: string) => string }) {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await apiClient.sendMessage(formData);
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            {t('Name', 'Nom')} *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            {t('Email', 'Email')} *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          />
        </div>
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-900 mb-2">
          {t('Subject', 'Sujet')} *
        </label>
        <input
          type="text"
          required
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        />
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-900 mb-2">
          {t('Message', 'Message')} *
        </label>
        <textarea
          required
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        />
      </div>
      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
      >
        {status === 'sending' ? t('Sending...', 'Envoi...') : 
         status === 'success' ? t('Message sent!', 'Message envoyé!') :
         status === 'error' ? t('Error, try again', 'Erreur, réessayez') :
         t('Send Message', 'Envoyer')}
      </button>
    </form>
  );
}

