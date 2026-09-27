'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

function AnimatedNumber({ value, suffix = '', duration = 1200 }: { value: number; suffix?: string; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frameId = 0;
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Math.min((Date.now() - startTime) / duration, 1);
      const eased = 1 - (1 - elapsed) ** 3;
      setDisplayValue(Math.round(value * eased));

      if (elapsed < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frameId);
  }, [duration, value]);

  return <span>{displayValue}{suffix}</span>;
}

function SocialIcon({ platform }: { platform: 'github' | 'linkedin' | 'facebook' | 'instagram' }) {
  const commonProps = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: 'about-developer-social-icon',
  };

  if (platform === 'github') {
    return (
      <svg {...commonProps}>
        <path d="M9 19c-4.3 1.3-4.3-2.1-6-2.5M15 22v-3.5c0-1.4-.5-2.8-1.8-3.8 4.1-.5 8.3-2 8.3-9.2A6.8 6.8 0 0 0 18.9 4a6.3 6.3 0 0 0-.1-4.7S17.6.3 15 2.3a16.6 16.6 0 0 0-9 0C3.4.3 2.5.4 2.5.4A6.3 6.3 0 0 0 2.4 5a6.8 6.8 0 0 0-1.4 4.8c0 7.1 4.1 8.7 8.2 9.2A4.5 4.5 0 0 1 9 18.5V22" />
      </svg>
    );
  }

  if (platform === 'linkedin') {
    return (
      <svg {...commonProps}>
        <path d="M8 10v8M8 6.5v.1M12 18v-5.2a2.2 2.2 0 0 1 4.4 0V18M4 10h8M4 18h8" />
        <rect x="3" y="3" width="18" height="18" rx="3" />
      </svg>
    );
  }

  if (platform === 'facebook') {
    return (
      <svg {...commonProps}>
        <path d="M14.5 8.5h2.5V4.8c-.4-.1-1.8-.3-3.4-.3-3.4 0-5.6 2-5.6 5.8v2.7H5v3.7h3v9h3.9v-9h3.2l.6-3.7h-3.8v-2.2c0-1.2.4-2 1.6-2Z" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <path d="M11.5 8.5c1.1 0 2.1.8 2.1 1.9 0 1.7-1.6 2-2.2 3.3-.2.5.2 1.2.8 1.2h.9" />
      <path d="M12 15.5h.1" />
      <circle cx="9.6" cy="10" r=".7" fill="currentColor" stroke="none" />
      <circle cx="14.4" cy="10" r=".7" fill="currentColor" stroke="none" />
    </svg>
  );
}

const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/younaskhan-dev', platform: 'github' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/younaskhanofficial', platform: 'linkedin' },
  { label: 'Facebook', href: 'https://facebook.com/share/1BUoC6QYuJ', platform: 'facebook' },
  { label: 'Instagram', href: 'https://instagram.com/younas_khn1822', platform: 'instagram' },
] as const;

const skills = [
  'Next.js',
  'TypeScript',
  'React',
  'Node.js',
  'Express',
  'Prisma',
  'PostgreSQL',
  'MongoDB',
  'ASP.NET Core',
  'Tailwind CSS',
  'UI/UX',
  'System Design',
];

const skillPalette: Record<string, 'frontend' | 'backend' | 'database' | 'design'> = {
  'Next.js': 'frontend',
  TypeScript: 'frontend',
  React: 'frontend',
  'Node.js': 'backend',
  Express: 'backend',
  Prisma: 'backend',
  PostgreSQL: 'database',
  MongoDB: 'database',
  'ASP.NET Core': 'backend',
  'Tailwind CSS': 'frontend',
  'UI/UX': 'design',
  'System Design': 'design',
};

const highlightStats = [
  { value: 3, suffix: '+', label: 'Years of learning', accent: 'emerald' },
  { value: 12, suffix: '+', label: 'Core stacks', accent: 'violet' },
  { value: 100, suffix: '%', label: 'Product focus', accent: 'amber' },
];

export default function AboutDeveloperPage() {
  return (
    <div className="about-developer-page">
      <div className="dashboard-page__glow" />

      <div className="about-developer-shell">
        <header className="dashboard-topbar">
          <div className="dashboard-topbar__crumbs">
            <span>Family Hierarchy</span>
            <span className="separator">/</span>
            <span className="current">About Developer</span>
          </div>
          <a href="https://younas-khan-portfolio.vercel.app/" target="_blank" rel="noreferrer" className="dashboard-topbar__button">
            Portfolio
          </a>
        </header>

        <section className="about-developer-hero">
          <div className="about-developer-profile">
            <div className="about-developer-photo-wrap">
              <Image
                src="/younas%20khan%20img.jpeg"
                alt="Younas Khan portrait"
                width={260}
                height={260}
                priority
                className="about-developer-photo"
              />
            </div>

            <div className="about-developer-intro">
              <p className="about-developer-kicker">About the developer</p>
              <h1 className="about-developer-name">Younas Khan</h1>
              <p className="about-developer-role">Full-Stack Engineer | Architecting End-to-End Digital Products</p>
            </div>
          </div>
        </section>

        <section className="about-developer-info">
          <article className="about-developer-card">
            <h3>About</h3>
            <p>
              I am a Full-Stack Software Engineer with a passion for transforming complex ideas and data
              models into modern, scalable, and intuitive web applications. Operating at the intersection of
              sleek UI/UX and engineering, I specialize in delivering complete digital products—from database
              design and backend architecture to responsive front-end user interfaces.
            </p>
            <p>
              My philosophy centers on clean code, modular systems, and cohesive design. Whether structuring
              complex hierarchical data, optimizing client-side performance, or crafting high-converting user
              experiences, I focus on building resilient software that scales smoothly while keeping the product
              intuitive and elegant.
            </p>

            <div className="about-developer-metrics" aria-label="Developer highlights">
              {highlightStats.map((item, index) => (
                <div key={item.label} className={`about-developer-metric about-developer-metric--${item.accent}`} style={{ animationDelay: `${index * 90}ms` }}>
                  <span className="about-developer-metric-icon">{item.accent === 'emerald' ? '◎' : item.accent === 'violet' ? '◈' : '✦'}</span>
                  <strong><AnimatedNumber value={item.value} suffix={item.suffix} duration={1200 + index * 180} /></strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </article>

          <aside className="about-developer-skills">
            <h3>Core Capabilities</h3>
            <div className="about-developer-skill-list">
              {skills.map((skill, index) => (
                <span key={skill} className={`about-developer-skill about-developer-skill--${skillPalette[skill]}`} style={{ animationDelay: `${index * 80}ms` }}>
                  {skill}
                </span>
              ))}
            </div>
          </aside>
        </section>

        <section className="about-developer-social">
          <div className="about-developer-social-header">
            <h3>Connect</h3>
          </div>

          <div className="about-developer-social-row">
            {socialLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="about-developer-social-item"
                aria-label={item.label}
                title={item.label}
              >
                <SocialIcon platform={item.platform} />
              </a>
            ))}
          </div>

          <a
            href="https://younas-khan-portfolio.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="about-developer-cta"
          >
            View Portfolio
          </a>
        </section>
      </div>
    </div>
  );
}
