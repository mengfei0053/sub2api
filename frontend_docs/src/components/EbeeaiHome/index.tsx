import type {ReactNode, SVGProps} from 'react';
import {useEffect, useMemo, useState} from 'react';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import LocaleSwitcher from '@site/src/components/LocaleSwitcher';
import HomeSeo from '@site/src/components/HomeSeo';
import {
  consoleUrl,
  docUrl,
  getHomeContent,
  getStoredLocale,
  loginUrl,
  setStoredLocale,
  siteName,
  type HomeLocale,
} from '@site/src/data/homeContent';
import styles from './styles.module.css';

function IconChart(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l4-4 4 4 8-10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 7h4v4" />
    </svg>
  );
}

function IconSwap(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h11l-3-3m3 13H7l3 3" />
    </svg>
  );
}

function IconShield(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"
      />
    </svg>
  );
}

function IconServer(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <rect x="3" y="4" width="18" height="6" rx="1.5" />
      <rect x="3" y="14" width="18" height="6" rx="1.5" />
      <circle cx="7" cy="7" r="1" fill="currentColor" stroke="none" />
      <circle cx="7" cy="17" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconArrow(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6l6 6-6 6" />
    </svg>
  );
}

function IconMenu(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function IconClose(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

const featureIcons = {
  performance: IconChart,
  multiModel: IconSwap,
  security: IconShield,
  cost: IconServer,
} as const;

export default function EbeeaiHome(): ReactNode {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [locale, setLocale] = useState<HomeLocale>('zh');
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    setLocale(getStoredLocale());
  }, []);

  const c = useMemo(() => getHomeContent(locale), [locale]);

  const handleLocaleChange = (next: HomeLocale) => {
    setLocale(next);
    setStoredLocale(next);
  };

  /** Same logic as frontend_self EbeeaiHomePage navLinks */
  const navLinks = useMemo(() => {
    const docsHref = docUrl || '#cta';
    return [
      {href: '#features', label: c.nav.features},
      {href: '#stats', label: c.nav.solutions},
      {href: '#cta', label: c.nav.pricing},
      {href: docsHref, label: c.nav.docs},
    ];
  }, [c]);

  const footerLinks = [
    {href: `${consoleUrl}/legal/privacy`, label: c.footer.privacy},
    {href: `${consoleUrl}/legal/terms`, label: c.footer.terms},
    {href: `${consoleUrl}/legal/security`, label: c.footer.security},
    {href: `${consoleUrl}/legal/status`, label: c.footer.status},
  ];

  return (
    <div className={clsx('ebeeai-home', styles.home)}>
      <HomeSeo locale={locale} />
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link to="/" className={styles.brand}>
            <img src="/img/logo.png" alt={siteName} className={styles.brandLogo} />
            <span className={styles.brandName}>{siteName}</span>
          </Link>

          <div className={styles.navLinks}>
            {navLinks.map((link) =>
              link.href.startsWith('/') ? (
                <Link key={link.href} to={link.href} className={styles.navLink}>
                  {link.label}
                </Link>
              ) : (
                <a key={link.href} href={link.href} className={styles.navLink}>
                  {link.label}
                </a>
              ),
            )}
          </div>

          <div className={styles.navActions}>
            <LocaleSwitcher locale={locale} onChange={handleLocaleChange} />
            <a href={loginUrl} className={styles.navCta}>
              {c.nav.getStarted}
            </a>
            <button
              type="button"
              className={styles.menuButton}
              aria-label={c.nav.menu}
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen((open) => !open)}>
              {mobileNavOpen ? (
                <IconClose className={styles.menuIcon} />
              ) : (
                <IconMenu className={styles.menuIcon} />
              )}
            </button>
          </div>
        </div>

        {mobileNavOpen && (
          <div className={styles.mobileNav}>
            {navLinks.map((link) =>
              link.href.startsWith('/') ? (
                <Link
                  key={link.href}
                  to={link.href}
                  className={styles.mobileNavLink}
                  onClick={() => setMobileNavOpen(false)}>
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className={styles.mobileNavLink}
                  onClick={() => setMobileNavOpen(false)}>
                  {link.label}
                </a>
              ),
            )}
            <a href={loginUrl} className={styles.mobileNavCta}>
              {c.nav.getStarted}
            </a>
          </div>
        )}
      </nav>

      <main className={styles.scrollContainer}>
        <section id="hero" className={clsx(styles.section, styles.heroSection, styles.dotGrid)}>
          <div className={styles.heroGradient} />
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <span className={styles.heroBadgeDot} />
              {c.hero.badge}
            </div>
            <h1 className={styles.heroTitle}>
              {c.hero.title}
              <br />
              {c.hero.titleLine2}
            </h1>
            <p className={styles.heroSubtitle}>{c.hero.subtitle}</p>
            <div className={styles.heroActions}>
              <a href={loginUrl} className={clsx(styles.btn, styles.btnPrimary, styles.btnLarge)}>
                {c.hero.trial}
                <IconArrow className={styles.btnIcon} />
              </a>
              <Link to="/docs/agent-tools/" className={clsx(styles.btn, styles.btnOutline, styles.btnLarge)}>
                {c.hero.readDocs}
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className={clsx(styles.section, styles.featuresSection)}>
          <div className={styles.contentWrap}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{c.features.title}</h2>
              <p className={styles.sectionSubtitle}>{c.features.subtitle}</p>
            </div>
            <div className={styles.featureGrid}>
              {c.features.items.map((item) => {
                const Icon = featureIcons[item.key as keyof typeof featureIcons] ?? IconChart;
                return (
                  <article key={item.key} className={styles.featureCard}>
                    <div className={styles.featureIconWrap}>
                      <Icon className={styles.featureIcon} />
                    </div>
                    <h3 className={styles.featureTitle}>{item.title}</h3>
                    <p className={styles.featureDesc}>{item.desc}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="stats" className={clsx(styles.section, styles.statsSection, styles.dotGrid)}>
          <div className={styles.contentWrap}>
            <div className={styles.statsIntro}>
              <h2 className={styles.sectionTitle}>{c.stats.title}</h2>
              <p className={styles.sectionSubtitle}>{c.stats.subtitle}</p>
            </div>
            <div className={styles.statsGrid}>
              {c.stats.items.map((stat) => (
                <div key={stat.label} className={styles.statCard}>
                  <div className={styles.statValue}>{stat.value}</div>
                  <div className={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="cta" className={clsx(styles.section, styles.ctaSection)}>
          <div className={styles.contentWrap}>
            <div className={styles.ctaInner}>
              <p className={styles.partnersLabel}>{c.partners.label}</p>
              <div className={styles.partners}>
                {c.partners.names.map((name) => (
                  <span key={name} className={styles.partnerName}>
                    {name}
                  </span>
                ))}
              </div>
              <div className={styles.divider} />
              <h2 className={styles.ctaTitle}>
                {c.cta.title}
                <br />
                {c.cta.titleLine2}
              </h2>
              <a href={loginUrl} className={clsx(styles.btn, styles.btnPrimary, styles.btnLarge, styles.ctaButton)}>
                {c.cta.button}
                <IconArrow className={styles.btnIcon} />
              </a>
            </div>

            <section className={styles.faqSection} aria-labelledby="home-faq-title">
              <div className={styles.faqHeader}>
                <p className={styles.faqEyebrow}>{c.faq.eyebrow}</p>
                <h2 id="home-faq-title" className={styles.faqTitle}>
                  {c.faq.title}
                </h2>
              </div>
              <div className={styles.faqGrid}>
                {c.faq.items.map((item) => (
                  <article key={item.key} className={styles.faqCard}>
                    <h3 className={styles.faqQuestion}>{item.question}</h3>
                    <p className={styles.faqAnswer}>{item.answer}</p>
                  </article>
                ))}
              </div>
            </section>

            <footer className={styles.footer}>
              <div className={styles.footerBrand}>
                <img src="/img/logo.png" alt={siteName} className={styles.footerLogo} />
                <span className={styles.footerCopy}>
                  © {currentYear} {siteName}. {c.footer.allRightsReserved}
                </span>
              </div>
              <div className={styles.footerLinks}>
                {footerLinks.map((link) => (
                  <a key={link.href} href={link.href} className={styles.footerLink}>
                    {link.label}
                  </a>
                ))}
                {docUrl ? (
                  <a href={docUrl} className={styles.footerLink}>
                    {c.footer.docs}
                  </a>
                ) : null}
              </div>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
}
