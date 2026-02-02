'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';
import type { Project, Skill, WorkExperience, Education, Hobby, Testimonial, ContactInfo, Resume } from '@/lib/api/client';
import { Mail, Phone, MapPin, Link as LinkIcon, Github, ExternalLink, Star, Download, FileText } from 'lucide-react';

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
    resume: null as Resume | null,
  });

  useEffect(() => {
    loadData();
  }, []);

  // Reload resume when language changes
  useEffect(() => {
    loadResume();
  }, [lang]);

  const loadResume = async () => {
    try {
      const resume = await apiClient.getPublicResume(lang).catch((err) => {
        console.error('Failed to load resume:', err);
        return { resume: null };
      });
      
      setData(prevData => ({
        ...prevData,
        resume: resume.resume || null,
      }));
    } catch (error) {
      console.error('Failed to load resume:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [projects, skills, experiences, education, hobbies, testimonials, contactInfo, resume] = await Promise.all([
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
        apiClient.getPublicResume(lang).catch((err) => {
          console.error('Failed to load resume:', err);
          return { resume: null };
        }),
      ]);

      console.log('Resume API Response:', resume);
      console.log('Resume Data:', resume.resume);

      console.log('Loaded data:', {
        projects: projects.projects.length,
        skills: skills.skills.length,
        experiences: experiences.experiences.length,
        education: education.education.length,
        hobbies: hobbies.hobbies.length,
        testimonials: testimonials.testimonials.length,
        contactInfo: contactInfo.contactInfo.length,
        resume: resume.resume ? 'Available' : 'None',
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
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/95 backdrop-blur-md border-b border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold gradient-text">
              Portfolio
            </h1>
            <div className="flex items-center gap-6">
              <a href="#about" className="text-gray-300 hover:text-blue-400 transition-colors">
                {t('About', 'À propos')}
              </a>
              <a href="#projects" className="text-gray-300 hover:text-blue-400 transition-colors">
                {t('Projects', 'Projets')}
              </a>
              <a href="#skills" className="text-gray-300 hover:text-blue-400 transition-colors">
                {t('Skills', 'Compétences')}
              </a>
              <a href="#experience" className="text-gray-300 hover:text-blue-400 transition-colors">
                {t('Experience', 'Expérience')}
              </a>
              <a href="#education" className="text-gray-300 hover:text-blue-400 transition-colors">
                {t('Education', 'Formation')}
              </a>
              <a href="#hobbies" className="text-gray-300 hover:text-blue-400 transition-colors">
                {t('Hobbies', 'Loisirs')}
              </a>
              <a href="#resume" className="text-gray-300 hover:text-blue-400 transition-colors">
                {t('Resume', 'CV')}
              </a>
              <a href="#contact" className="text-gray-300 hover:text-blue-400 transition-colors">
                {t('Contact', 'Contact')}
              </a>
              <button
                onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}
                className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-medium hover:bg-blue-500/30 transition-all border border-blue-500/30"
              >
                {lang === 'en' ? 'FR' : 'EN'}
              </button>
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all text-sm font-medium shadow-lg shadow-blue-500/20"
              >
                {t('Admin', 'Admin')}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-black via-blue-950/20 to-purple-950/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10 animate-fade-in">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-slide-up">
            {t('Welcome to My Portfolio', 'Bienvenue sur mon Portfolio')}
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto animate-slide-up" style={{animationDelay: '0.1s'}}>
            {t(
              'Explore my work, skills, and professional journey',
              'Découvrez mon travail, mes compétences et mon parcours professionnel'
            )}
          </p>
          <div className="flex gap-4 justify-center animate-slide-up" style={{animationDelay: '0.2s'}}>
            <a
              href="#projects"
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:scale-105"
            >
              {t('View Projects', 'Voir les projets')}
            </a>
            <a
              href="#contact"
              className="px-8 py-3 border-2 border-blue-500 text-blue-400 rounded-lg hover:bg-blue-500/10 transition-all font-medium hover:border-purple-500 hover:text-purple-400 transform hover:scale-105"
            >
              {t('Get in Touch', 'Me contacter')}
            </a>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-4xl font-bold text-center text-white mb-12 gradient-text">{t('Featured Projects', 'Projets en vedette')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.projects.slice(0, 6).map((project) => (
              <ProjectCard key={project.id} project={project} lang={lang} />
            ))}
          </div>
          {data.projects.length === 0 && (
            <p className="text-center text-gray-400 text-lg col-span-full">{t('No projects yet', 'Aucun projet pour le moment')}</p>
          )}
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-gray-950">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-4xl font-bold text-center text-white mb-12 gradient-text">{t('Skills & Expertise', 'Compétences et expertise')}</h3>
          <SkillsGrid skills={data.skills} lang={lang} />
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-4xl font-bold text-center text-white mb-12 gradient-text">{t('Work Experience', 'Expérience professionnelle')}</h3>
          {data.experiences.length > 0 ? (
            <div className="space-y-8">
              {data.experiences.map((exp) => (
                <ExperienceCard key={exp.id} experience={exp} lang={lang} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 text-lg">
              {t('No work experience added yet', 'Aucune expérience professionnelle ajoutée')}
            </p>
          )}
        </div>
      </section>

      {/* Education Section */}
      <section id="education" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-gray-950">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-4xl font-bold text-center text-white mb-12 gradient-text">{t('Education', 'Formation')}</h3>
          {data.education.length > 0 ? (
            <div className="space-y-8">
              {data.education.map((edu) => (
                <EducationCard key={edu.id} education={edu} lang={lang} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 text-lg">
              {t('No education history added yet', 'Aucune formation ajoutée')}
            </p>
          )}
        </div>
      </section>

      {/* Hobbies & Interests Section */}
      <section id="hobbies" className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-4xl font-bold text-center text-white mb-12 gradient-text">
            {t('Hobbies & Interests', 'Loisirs et intérêts')}
          </h3>
          {data.hobbies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.hobbies.map((hobby) => (
                <HobbyCard key={hobby.id} hobby={hobby} lang={lang} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 text-lg">
              {t('No hobbies added yet', 'Aucun loisir ajouté')}
            </p>
          )}
        </div>
      </section>

      {/* Resume Download Section - Always Visible */}
      <section id="resume" className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-4xl mx-auto">
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
                  {t('Download My Resume', 'Télécharger mon CV')}
                </h3>
                
                <p className="text-gray-300 mb-2 text-lg font-medium">
                  {data.resume.filename}
                </p>
                
                <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                  {t(
                    'Get a comprehensive overview of my experience, skills, and qualifications',
                    'Obtenez un aperçu complet de mon expérience, mes compétences et qualifications'
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
                  {t('Download Resume', 'Télécharger le CV')}
                </a>
                
                <p className="text-xs text-gray-500 mt-4">
                  {t('PDF Format • Last Updated', 'Format PDF • Dernière mise à jour')} {new Date(data.resume.createdAt).toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR')}
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
                  {t('Resume Coming Soon', 'CV Bientôt Disponible')}
                </h3>
                
                <p className="text-gray-500 mb-8 max-w-2xl mx-auto">
                  {t(
                    'My professional resume will be available for download here soon. Stay tuned!',
                    'Mon CV professionnel sera bientôt disponible en téléchargement ici. Restez à l\'écoute!'
                  )}
                </p>
                
                <button
                  disabled
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gray-800 text-gray-500 text-lg font-semibold rounded-lg cursor-not-allowed opacity-50"
                >
                  <FileText className="w-6 h-6" />
                  {t('No Resume Available', 'CV Non Disponible')}
                </button>
                
                <p className="text-xs text-gray-600 mt-4">
                  {t('Check back later for updates', 'Revenez plus tard pour les mises à jour')}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      {data.testimonials.length > 0 && (
        <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-4xl font-bold text-center text-white mb-12 gradient-text">{t('Testimonials', 'Témoignages')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.testimonials.slice(0, 6).map((testimonial) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Submit Testimonial Section */}
      <section id="submit-testimonial" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-950/30 to-pink-950/30">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-4xl font-bold text-center text-white mb-4 gradient-text">
            {t('Share Your Experience', 'Partagez votre expérience')}
          </h3>
          <p className="text-center text-gray-400 mb-12">
            {t(
              'Have you worked with me? I\'d love to hear your feedback!',
              'Avez-vous travaillé avec moi ? J\'aimerais connaître votre avis !'
            )}
          </p>
          <TestimonialForm lang={lang} t={t} />
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-950/30 to-indigo-950/30">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-4xl font-bold text-center text-white mb-12 gradient-text">{t('Get in Touch', 'Contactez-moi')}</h3>
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
      <footer className="bg-gray-950 text-gray-400 py-8 px-4 border-t border-gray-800">
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
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 transform hover:scale-105 animate-scale-in group">
      {project.imageUrl && (
        <div className="h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 relative overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={project.imageUrl} alt={getTitle()} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
        </div>
      )}
      <div className="p-6">
        <h4 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{getTitle()}</h4>
        <p className="text-gray-400 mb-4 line-clamp-3">{getDescription()}</p>
        {project.technologies && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.technologies.slice(0, 3).map((tech, i) => (
              <span key={i} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium border border-blue-500/30">
                {tech}
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-3">
          {project.projectUrl && (
            <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
              <ExternalLink size={14} />
              {lang === 'en' ? 'View Project' : 'Voir le projet'}
            </a>
          )}
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">
              <Github size={14} />
              GitHub
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
      <p className="text-center text-gray-400 text-lg">
        {lang === 'en' ? 'No skills added yet' : 'Aucune compétence ajoutée'}
      </p>
    );
  }

  const grouped = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  const colors = ['blue', 'purple', 'pink', 'green', 'yellow', 'red'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Object.entries(grouped).map(([category, categorySkills], index) => {
        const color = colors[index % colors.length];
        return (
          <div key={category} className="bg-gray-900 rounded-lg border border-gray-800 p-6 hover:border-blue-500 transition-all animate-scale-in group">
            <h4 className={`text-lg font-bold mb-4 text-${color}-400 group-hover:text-${color}-300 transition-colors`}>{category}</h4>
            <div className="flex flex-wrap gap-2">
              {categorySkills.map((skill) => (
                <span key={skill.id} className={`px-3 py-1 bg-${color}-500/20 text-${color}-400 rounded-full text-sm font-medium border border-${color}-500/30 hover:bg-${color}-500/30 transition-colors`}>
                  {typeof skill.name === 'object' && skill.name !== null ? skill.name[lang] : skill.name}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ExperienceCard({ experience, lang }: { experience: WorkExperience; lang: 'en' | 'fr' }) {
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 border-l-4 border-l-blue-500 p-6 hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/20 animate-slide-up group">
      <h4 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{experience.position[lang]}</h4>
      <p className="text-lg text-blue-400 mt-1">{experience.company[lang]}</p>
      <p className="text-sm text-gray-400 mt-1">{experience.location[lang]}</p>
      <p className="text-sm text-gray-300 mt-3">{experience.description[lang]}</p>
      <p className="text-sm text-gray-500 mt-3">
        {experience.startDate} - {experience.current ? (lang === 'en' ? 'Present' : 'Présent') : experience.endDate}
      </p>
    </div>
  );
}

function EducationCard({ education, lang }: { education: Education; lang: 'en' | 'fr' }) {
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/20 animate-slide-up group">
      <h4 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">{education.degree[lang]}</h4>
      <p className="text-lg text-purple-400 mt-1">{education.institution[lang]}</p>
      <p className="text-sm text-gray-400 mt-1">{education.location[lang]}</p>
      {education.description && <p className="text-sm text-gray-300 mt-3">{education.description[lang]}</p>}
      <div className="flex gap-4 mt-3 text-sm text-gray-500">
        <span>{education.startDate} - {education.endDate || (lang === 'en' ? 'Present' : 'Présent')}</span>
        {education.gpa && <span>GPA: {education.gpa}</span>}
      </div>
    </div>
  );
}

function HobbyCard({ hobby, lang }: { hobby: Hobby; lang: 'en' | 'fr' }) {
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

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 hover:border-pink-500 transition-all hover:shadow-lg hover:shadow-pink-500/20 animate-scale-in group">
      <div className="flex mb-3">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={20}
            className={i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}
          />
        ))}
      </div>
      <p className="text-gray-300 mb-4 italic">&quot;{testimonial.message}&quot;</p>
      <div>
        <p className="font-semibold text-white">{testimonial.name}</p>
        <p className="text-sm text-pink-400">{testimonial.position}</p>
        {testimonial.company && <p className="text-sm text-gray-400">{testimonial.company}</p>}
      </div>
    </div>
  );
}

function ContactInfoCard({ info }: { info: ContactInfo }) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'email': return Mail;
      case 'phone': return Phone;
      case 'address': return MapPin;
      default: return LinkIcon;
    }
  };

  const Icon = getIcon(info.type);

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 text-center hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/20 transform hover:scale-105">
      <Icon className="w-8 h-8 mx-auto mb-2 text-blue-400" />
      <p className="text-gray-300 font-medium">{info.value}</p>
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
    <form onSubmit={handleSubmit} className="bg-gray-900 rounded-lg border border-gray-800 p-8 shadow-xl">
      {status === 'success' && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
          <p className="text-green-400 text-center font-medium">
            {t(
              '✓ Thank you! Your testimonial has been submitted and will be reviewed shortly.',
              '✓ Merci ! Votre témoignage a été soumis et sera examiné prochainement.'
            )}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t('Your Name', 'Votre nom')} *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500"
            placeholder={t('John Doe', 'Jean Dupont')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t('Email', 'Email')} *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500"
            placeholder="john@example.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t('Position', 'Poste')} *
          </label>
          <input
            type="text"
            required
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500"
            placeholder={t('Software Engineer', 'Ingénieur logiciel')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t('Company (Optional)', 'Entreprise (Optionnel)')}
          </label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500"
            placeholder={t('Tech Corp', 'Tech Corp')}
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {t('Rating', 'Note')} *
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFormData({ ...formData, rating: star })}
              className="transition-all focus:outline-none hover:scale-110 transform"
            >
              <Star
                size={28}
                className={star <= formData.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}
              />
            </button>
          ))}
          <span className="ml-2 text-gray-400 self-center">
            {formData.rating} / 5
          </span>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {t('Your Testimonial', 'Votre témoignage')} *
        </label>
        <textarea
          required
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500"
          placeholder={t(
            'Share your experience working with me...',
            'Partagez votre expérience de travail avec moi...'
          )}
        />
      </div>

      <button
        type="submit"
        disabled={status === 'sending' || status === 'success'}
        className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transform hover:scale-105"
      >
        {status === 'sending' ? t('Submitting...', 'Envoi en cours...') : 
         status === 'success' ? t('Submitted Successfully!', 'Soumis avec succès !') :
         status === 'error' ? t('Error, try again', 'Erreur, réessayez') :
         t('Submit Testimonial', 'Soumettre le témoignage')}
      </button>

      {status !== 'success' && (
        <p className="mt-4 text-sm text-gray-400 text-center">
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
    <form onSubmit={handleSubmit} className="bg-gray-900 rounded-lg border border-gray-800 p-8 shadow-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t('Name', 'Nom')} *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t('Email', 'Email')} *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500"
          />
        </div>
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {t('Subject', 'Sujet')} *
        </label>
        <input
          type="text"
          required
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500"
        />
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {t('Message', 'Message')} *
        </label>
        <textarea
          required
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500"
        />
      </div>
      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all font-medium disabled:opacity-50 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:scale-105"
      >
        {status === 'sending' ? t('Sending...', 'Envoi...') : 
         status === 'success' ? t('Message sent!', 'Message envoyé!') :
         status === 'error' ? t('Error, try again', 'Erreur, réessayez') :
         t('Send Message', 'Envoyer')}
      </button>
    </form>
  );
}

