import React, { useState } from 'react';
import './App.css';
import logo from './assets/logo.png';
import {
  HiOutlineDocumentText,
  HiOutlineScale,
  HiOutlineChip,
  HiOutlineLockClosed,
  HiOutlineCheckCircle,
  HiOutlineShieldCheck,
  HiOutlineArrowRight,
  HiOutlinePhone,
  HiOutlineLightningBolt,
  HiOutlineGlobe,
  HiOutlineRefresh,
  HiOutlineCurrencyEuro,
  HiOutlineGift,
  HiOutlineExclamationCircle,
  HiOutlineServer,
  HiOutlineEyeOff,
  HiOutlineClipboardCheck,
} from 'react-icons/hi';

// ─── PLATFORM MODULES ────────────────────────────────────────────────────────
const platformModules = {
  en: [
    { Icon: HiOutlineDocumentText, name: 'Contract Lifecycle', outcome: 'Never miss a renewal or signature again.' },
    { Icon: HiOutlineScale, name: 'Matter Management', outcome: 'Every case, deadline, and owner - visible at a glance.' },
    { Icon: HiOutlineRefresh, name: 'Workflow Automation', outcome: 'Approvals happen in hours, not weeks of email chains.' },
    { Icon: HiOutlineCurrencyEuro, name: 'Legal Spend', outcome: 'Know exactly what you spend on outside counsel - and why.' },
    { Icon: HiOutlineGift, name: 'Gifts & Invitations', outcome: 'Stay compliant without slowing down your teams.' },
    { Icon: HiOutlineChip, name: 'AI Assistant', outcome: 'Ask questions. Get answers from your own data instantly.' },
  ],
  fr: [
    { Icon: HiOutlineDocumentText, name: 'Cycle de vie des contrats', outcome: 'Plus jamais un renouvellement ou une signature manqués.' },
    { Icon: HiOutlineScale, name: 'Gestion des affaires', outcome: 'Chaque affaire, délai et responsable - visibles en un coup d\'œil.' },
    { Icon: HiOutlineRefresh, name: 'Automatisation', outcome: 'Les approbations en heures, pas en semaines d\'emails.' },
    { Icon: HiOutlineCurrencyEuro, name: 'Dépenses juridiques', outcome: 'Sachez exactement ce que vous dépensez en prestataires externes.' },
    { Icon: HiOutlineGift, name: 'Cadeaux & Invitations', outcome: 'Restez conforme sans ralentir vos équipes.' },
    { Icon: HiOutlineChip, name: 'Assistant IA', outcome: 'Posez des questions. Obtenez des réponses de vos propres données.' },
  ],
};

// ─── SERVICES (2 offerings) ────────────────────────────────────────────────────
const services = {
  en: [
    {
      tag: 'Consulting',
      name: 'Legal Ops Consulting',
      tagline: 'We build it inside your house.',
      desc: 'We come to you, map your legal processes end-to-end, and build the solution directly in your existing Microsoft infrastructure - Power Apps and Power Automate. No new software to procure, no data leaving your tenant.',
      bullets: [
        'Process audit & gap analysis',
        'Custom Power Apps development',
        'Workflow & approval automation via Power Automate',
        'Contract templates & digital playbooks',
        'Training and change management',
        'Runs entirely in your Azure / M365 tenant',
      ],
      cta: 'Talk to us about consulting',
      featured: false,
    },
    {
      tag: 'SaaS Platform',
      name: 'Legal Space Platform',
      tagline: 'One platform. Everything legal.',
      desc: 'Our purpose-built legal ops platform - deployed in your Azure or ours. CLM, Matter Management, Gifts & Invitations compliance, Legal Spend tracking, and an AI assistant trained on your own data. Up and running in days.',
      bullets: [
        'Contract Lifecycle Management (CLM)',
        'Matter & deadline management',
        'Gifts & Invitations compliance register',
        'Legal spend & outside counsel control',
        'AI assistant - your data, your answers',
        'Deploys in your Azure or managed by us',
      ],
      cta: 'Explore the platform',
      featured: true,
    },
  ],
  fr: [
    {
      tag: 'Conseil',
      name: 'Conseil Legal Ops',
      tagline: 'Nous construisons chez vous.',
      desc: 'Nous venons chez vous, cartographions vos processus juridiques de bout en bout, et construisons la solution directement dans votre infrastructure Microsoft existante - Power Apps et Power Automate. Pas de nouveau logiciel, pas de données qui quittent votre tenant.',
      bullets: [
        'Audit des processus & analyse des écarts',
        'Développement Power Apps sur mesure',
        'Automatisation via Power Automate',
        'Modèles de contrats & playbooks digitaux',
        'Formation et conduite du changement',
        'Fonctionne entièrement dans votre tenant Azure / M365',
      ],
      cta: 'Parler du conseil',
      featured: false,
    },
    {
      tag: 'Plateforme SaaS',
      name: 'Plateforme Legal Space',
      tagline: 'Une plateforme. Tout le juridique.',
      desc: 'Notre plateforme legal ops dédiée - déployée dans votre Azure ou le nôtre. CLM, gestion des affaires, conformité cadeaux & invitations, suivi des dépenses juridiques, et un assistant IA entraîné sur vos propres données.',
      bullets: [
        'Contract Lifecycle Management (CLM)',
        'Gestion des affaires & délais',
        'Registre conformité cadeaux & invitations',
        'Dépenses juridiques & prestataires externes',
        'Assistant IA - vos données, vos réponses',
        'Déployé dans votre Azure ou géré par nous',
      ],
      cta: 'Explorer la plateforme',
      featured: true,
    },
  ],
};

// ─── CONTENT ──────────────────────────────────────────────────────────────────
const content = {
  en: {
    nav: {
      services: 'Services',
      platform: 'Platform',
      about: 'About',
      cta: 'Book a call',
    },
    hero: {
      eyebrow: 'Legal Space',
      h1a: 'Your legal department,',
      h1b: 'running at full speed.',
      p: 'Legal Space helps in-house legal teams work smarter - through consulting, a purpose-built platform, and operational support. We handle the complexity so your team can focus on what matters.',
      btn1: 'Book a discovery call',
      btn2: 'See our platform',
      stat1n: '2–4 weeks', stat1l: 'to first results',
      stat2n: 'EU', stat2l: 'data residency',
      stat3n: 'FR · EN · RO', stat3l: 'multilingual team',
    }, 
    why_now: {
      eyebrow: 'Why legal ops, why now',
      title: 'Legal is the last department still running on email and spreadsheets',
      sub: 'Every other function has been digitised. Legal hasn\'t. That gap is now a risk.',
      pains: [
        { stat: '65%', label: 'of contract renewals are missed or delayed due to manual tracking' },
        { stat: '12h', label: 'per week lost per lawyer on administrative tasks that software can eliminate' },
        { stat: '3×', label: 'more outside counsel spend in companies without legal ops visibility' },
      ],
      cta: 'See how we fix this',
    },
    packages: {
      eyebrow: 'How we work',
      title: 'Two ways to work with us',
      sub: 'Consulting builds inside your existing Microsoft stack. The platform is our own product. Pick one - or combine both.',
    },
    platform: {
      eyebrow: 'Our platform',
      title: 'Six modules. One login. Full control.',
      sub: 'You see outcomes, not features. Start with one module, expand when ready.',
      cta: 'Learn more about the platform',
    },
    security: {
      eyebrow: 'Data protection & IT security',
      title: 'Legal teams get audited. So does our platform.',
      sub: 'We built security in from day one - not as a checkbox, but because your clients\' data demands it.',
      items: [
        { Icon: HiOutlineServer, title: 'Deployed in your Azure', desc: 'Your data never leaves your infrastructure. The platform runs inside your own Azure tenant - not ours.' },
        { Icon: HiOutlineLockClosed, title: 'GDPR by design', desc: 'EU data residency, role-based access, full audit trail. Compliant out of the box.' },
        { Icon: HiOutlineEyeOff, title: 'AI that stays in-house', desc: 'The AI assistant runs on your data only. No training on your contracts. No data shared with third parties.' },
        { Icon: HiOutlineClipboardCheck, title: 'Audit-ready', desc: 'Every action logged. Every approval traced. Every access recorded. Built for legal teams that get audited.' },
      ],
    },
    why: {
      eyebrow: 'Why Legal Space',
      title: 'A different kind of legal ops partner',
      items: [
        { Icon: HiOutlineGlobe, title: 'Multilingual by default', desc: 'French, English, Romanian - we work in your language, not ours.' },
        { Icon: HiOutlineLightningBolt, title: 'Fast to value', desc: 'First results in weeks, not quarters. We start where it hurts most.' },
        { Icon: HiOutlineScale, title: 'Legal + tech + ops', desc: 'Rare combination: legal understanding, technology delivery, and operational execution.' },
        { Icon: HiOutlineExclamationCircle, title: 'Honest about limits', desc: 'We don\'t do KYC or legal transformation alone - but we integrate with the specialists who do.' },
      ],
    },
    how: {
      eyebrow: 'How we work',
      title: 'From first call to full operation',
      steps: [
        { num: '01', title: 'Discovery', desc: 'We map your current processes, pain points, and priorities in a structured assessment.' },
        { num: '02', title: 'Design', desc: 'We propose the right combination of consulting, platform, and managed services for your situation.' },
        { num: '03', title: 'Deploy', desc: 'We implement fast - most teams are live within two to four weeks.' },
        { num: '04', title: 'Operate', desc: 'We stay close - through the platform, ongoing support, or as your extended legal ops team.' },
      ],
    },
    footer: {
      tagline: 'Legal operations, built to scale.',
      badges: ['EU data residency', 'GDPR compliant', 'Multilingual team'],
      copy: '© 2026 Legal Space',
    },
  },
  fr: {
    nav: {
      services: 'Services',
      platform: 'Plateforme',
      about: 'À propos',
      cta: 'Prendre rendez-vous',
    },
    hero: {
      eyebrow: 'Partenaire Legal Operations',
      h1a: 'Votre département juridique,',
      h1b: 'à pleine vitesse',
      p: 'Legal Space accompagne les équipes juridiques internes pour travailler plus efficacement - grâce au conseil, une plateforme dédiée et un support opérationnel. Nous gérons la complexité pour que votre équipe se concentre sur l\'essentiel.',
      btn1: 'Prendre un premier appel',
      btn2: 'Voir la plateforme',
      stat1n: '2–4 semaines', stat1l: 'pour les premiers résultats',
      stat2n: 'EU', stat2l: 'résidence des données',
      stat3n: 'FR · EN · RO', stat3l: 'équipe multilingue',
    },
    why_now: {
      eyebrow: 'Pourquoi le legal ops, pourquoi maintenant',
      title: 'Le juridique est le dernier département encore géré par emails et tableurs',
      sub: 'Toutes les autres fonctions ont été digitalisées. Le juridique, non. Cet écart est désormais un risque.',
      pains: [
        { stat: '65%', label: 'des renouvellements de contrats sont manqués ou retardés faute de suivi automatisé' },
        { stat: '12h', label: 'perdues par semaine et par juriste sur des tâches administratives que le logiciel peut éliminer' },
        { stat: '3×', label: 'plus de dépenses en prestataires externes dans les entreprises sans visibilité legal ops' },
      ],
      cta: 'Voir comment nous résolvons ça',
    },
    packages: {
      eyebrow: 'Comment nous travaillons',
      title: 'Deux façons de travailler avec nous',
      sub: 'Le conseil s\'intègre dans votre stack Microsoft existant. La plateforme est notre propre produit. Choisissez l\'un - ou combinez les deux.',
    },
    platform: {
      eyebrow: 'Notre plateforme',
      title: 'Six modules. Un seul login. Contrôle total.',
      sub: 'Vous voyez les résultats, pas les fonctionnalités. Commencez par un module, développez quand vous êtes prêt.',
      cta: 'En savoir plus sur la plateforme',
    },
    security: {
      eyebrow: 'Protection des données & sécurité IT',
      title: 'Les équipes juridiques sont auditées. Notre plateforme aussi.',
      sub: 'Nous avons intégré la sécurité dès le premier jour - pas comme une case à cocher, mais parce que les données de vos clients l\'exigent.',
      items: [
        { Icon: HiOutlineServer, title: 'Déployé dans votre Azure', desc: 'Vos données ne quittent jamais votre infrastructure. La plateforme tourne dans votre propre tenant Azure.' },
        { Icon: HiOutlineLockClosed, title: 'RGPD by design', desc: 'Résidence des données en EU, accès basé sur les rôles, piste d\'audit complète. Conforme par défaut.' },
        { Icon: HiOutlineEyeOff, title: 'IA qui reste chez vous', desc: 'L\'assistant IA tourne sur vos données uniquement. Pas d\'entraînement sur vos contrats. Pas de partage avec des tiers.' },
        { Icon: HiOutlineClipboardCheck, title: 'Prêt pour l\'audit', desc: 'Chaque action journalisée. Chaque approbation tracée. Chaque accès enregistré. Conçu pour les équipes auditées.' },
      ],
    },
    why: {
      eyebrow: 'Pourquoi Legal Space',
      title: 'Un partenaire legal ops différent',
      items: [
        { Icon: HiOutlineGlobe, title: 'Multilingue par nature', desc: 'Français, anglais, roumain - nous travaillons dans votre langue.' },
        { Icon: HiOutlineLightningBolt, title: 'Rapide à mettre en œuvre', desc: 'Premiers résultats en semaines, pas en trimestres.' },
        { Icon: HiOutlineScale, title: 'Juridique + tech + ops', desc: 'Une combinaison rare : compréhension juridique, livraison technologique et exécution opérationnelle.' },
        { Icon: HiOutlineExclamationCircle, title: 'Honnêtes sur nos limites', desc: 'Nous ne faisons pas le KYC seuls - mais nous nous intégrons avec les spécialistes qui le font.' },
      ],
    },
    how: {
      eyebrow: 'Notre méthode',
      title: 'Du premier appel à la pleine opération',
      steps: [
        { num: '01', title: 'Découverte', desc: 'Nous cartographions vos processus, points de douleur et priorités lors d\'un audit structuré.' },
        { num: '02', title: 'Conception', desc: 'Nous proposons la bonne combinaison de conseil, plateforme et services managés pour votre situation.' },
        { num: '03', title: 'Déploiement', desc: 'Nous déployons rapidement - la plupart des équipes sont opérationnelles en deux à quatre semaines.' },
        { num: '04', title: 'Opération', desc: 'Nous restons proches - via la plateforme, le support continu ou en tant qu\'équipe legal ops étendue.' },
      ],
    },
    footer: {
      tagline: 'Legal operations, conçu pour évoluer.',
      badges: ['Hébergement EU', 'Conforme RGPD', 'Équipe multilingue'],
      copy: '© 2026 Legal Space',
    },
  },
};

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState('en');
  const t = content[lang];
  const modules = platformModules[lang];
  const svcs = services[lang];
  const [activeStep, setActiveStep] = useState(0);
  const [userInteracted, setUserInteracted] = useState(false);

  React.useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  React.useEffect(() => {
    if (userInteracted) return;
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % 4);
    }, 1800);
    return () => clearInterval(interval);
  }, [userInteracted]);

  const handleStepClick = (i) => {
    setActiveStep(i);
    setUserInteracted(true);
  };

  return (
    <div className="App">

      {/* ── NAV ── */}
      <nav className="nav">
        <img src={logo} alt="Legal Space" className="nav-logo" />
        <ul className="nav-links">
          <li><a href="#why-now">{t.nav.services}</a></li>
          <li><a href="#platform">{t.nav.platform}</a></li>
          <li><a href="#security">{t.nav.about}</a></li>
        </ul>
        <div className="nav-right">
          <div className="lang-toggle">
            <button className={lang === 'en' ? 'lang-btn active' : 'lang-btn'} onClick={() => setLang('en')}>EN</button>
            <button className={lang === 'fr' ? 'lang-btn active' : 'lang-btn'} onClick={() => setLang('fr')}>FR</button>
          </div>
          <a href="#contact" className="btn-primary btn-sm">{t.nav.cta}</a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-hex-pattern" />
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            {t.hero.eyebrow}
          </div>
          <h1>
            {t.hero.h1a}<br />
            <em>{t.hero.h1b}</em>
          </h1>
          <p>{t.hero.p}</p>
          <div className="hero-actions">
            <a href="#contact" className="btn-primary">
              {t.hero.btn1} <HiOutlineArrowRight style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
            </a>
            <a href="#platform" className="btn-outline">{t.hero.btn2}</a>
          </div>
          <div className="hero-stats">
            <div>
              <div className="hero-stat-num">{t.hero.stat1n}</div>
              <div className="hero-stat-label">{t.hero.stat1l}</div>
            </div>
            <div>
              <div className="hero-stat-num">{t.hero.stat2n}</div>
              <div className="hero-stat-label">{t.hero.stat2l}</div>
            </div>
            <div>
              <div className="hero-stat-num">{t.hero.stat3n}</div>
              <div className="hero-stat-label">{t.hero.stat3l}</div>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <img src={logo} alt="Legal Space" className="hero-logo-big" />
        </div>
      </section>

      {/* ── WHY NOW (NEW - intro categorie) ── */}
      <section className="why-now-section" id="why-now">
        <div className="why-now-inner">
          <div className="why-now-header">
            <span className="section-eyebrow">{t.why_now.eyebrow}</span>
            <h2 className="section-title">{t.why_now.title}</h2>
            <p className="section-sub">{t.why_now.sub}</p>
          </div>
          <div className="pain-stats">
            {t.why_now.pains.map((p, i) => (
              <div className="pain-card" key={i}>
                <div className="pain-stat">{p.stat}</div>
                <p className="pain-label">{p.label}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <a href="#packages" className="btn-primary">
              {t.why_now.cta} <HiOutlineArrowRight style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
            </a>
          </div>
        </div>
      </section>

      {/* ── 2 SERVICES ── */}
      <section className="packages-section" id="packages">
        <div className="section-header">
          <span className="section-eyebrow">{t.packages.eyebrow}</span>
          <h2 className="section-title">{t.packages.title}</h2>
          <p className="section-sub">{t.packages.sub}</p>
        </div>
        <div className="services-two-grid">
          {svcs.map((svc, i) => (
            <div className={svc.featured ? 'svc-card svc-card--featured' : 'svc-card'} key={i}>
              <span className="svc-tag">{svc.tag}</span>
              <h3 className="svc-name">{svc.name}</h3>
              <p className="svc-tagline">{svc.tagline}</p>
              <p className="svc-desc">{svc.desc}</p>
              <ul className="svc-bullets">
                {svc.bullets.map((b, j) => (
                  <li key={j}>
                    <HiOutlineCheckCircle size={14} color={svc.featured ? 'rgba(255,255,255,0.7)' : '#27509b'} />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <a href="#contact" className={svc.featured ? 'svc-cta svc-cta--featured' : 'svc-cta'}>
                {svc.cta} <HiOutlineArrowRight size={14} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ── PLATFORM MODULES (outcomes, not features) ── */}
      <section className="platform-section" id="platform">
        <div className="section-header">
          <span className="section-eyebrow">{t.platform.eyebrow}</span>
          <h2 className="section-title">{t.platform.title}</h2>
          <p className="section-sub">{t.platform.sub}</p>
        </div>
        <div className="platform-grid">
          {modules.map((m, i) => (
            <div className="platform-card" key={i}>
              <div className="platform-icon-wrap">
                <m.Icon size={22} color="#27509b" />
              </div>
              <div className="platform-card-text">
                <h3>{m.name}</h3>
                <p>{m.outcome}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <a href="#contact" className="btn-outline">
            {t.platform.cta} <HiOutlineArrowRight style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
          </a>
        </div>
      </section>

      {/* ── SECURITY (NEW - secțiune proprie, sus, nu doar footer badges) ── */}
      <section className="security-section" id="security">
        <div className="security-inner">
          <div className="section-header">
            <span className="section-eyebrow">{t.security.eyebrow}</span>
            <h2 className="section-title">{t.security.title}</h2>
            <p className="section-sub">{t.security.sub}</p>
          </div>
          <div className="security-grid">
            {t.security.items.map((s, i) => (
              <div className="security-card" key={i}>
                <div className="security-icon-wrap">
                  <s.Icon size={22} color="#27509b" />
                </div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className="why-section" id="about">
        <div className="why-inner">
          <div className="why-left">
            <span className="section-eyebrow">{t.why.eyebrow}</span>
            <h2 className="section-title" style={{ textAlign: 'left' }}>{t.why.title}</h2>
          </div>
          <div className="why-grid">
            {t.why.items.map((w, i) => (
              <div className="why-card" key={i}>
                <div className="why-icon-wrap">
                  <w.Icon size={22} color="#27509b" />
                </div>
                <h3>{w.title}</h3>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW ── */}
      <section className="how-section">
        <div className="how-inner">
          <div className="section-header">
            <span className="section-eyebrow">{t.how.eyebrow}</span>
            <h2 className="section-title">{t.how.title}</h2>
          </div>
          <div className="how-progress-bar">
            <div className="how-progress-fill" style={{ width: `${((activeStep + 1) / 4) * 100}%` }} />
          </div>
          <div className="how-steps">
            {t.how.steps.map((s, i) => (
              <div
                className={i <= activeStep ? 'how-step active' : 'how-step'}
                key={i}
                onClick={() => handleStepClick(i)}
              >
                <div className="how-step-num">{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                {i < t.how.steps.length - 1 && (
                  <div className="how-step-arrow">
                    <HiOutlineArrowRight size={18} color={i < activeStep ? '#27509b' : '#d0ddf0'} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA STRIP ── */}
      <section className="cta-strip" id="contact">
        <div className="cta-strip-inner">
          <HiOutlinePhone size={32} color="rgba(255,255,255,0.7)" />
          <div>
            <h2>{lang === 'en' ? 'Ready to talk?' : 'Prêt à discuter ?'}</h2>
            <p>{lang === 'en'
              ? 'Book a 30-minute discovery call. No pitch, just a conversation about where you are and what would actually help.'
              : 'Réservez un appel de découverte de 30 minutes. Pas de discours commercial - juste une conversation sur votre situation.'
            }</p>
          </div>
          <a href="mailto:contact@legalspace.eu" className="btn-white">
            {t.nav.cta} <HiOutlineArrowRight style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer" id="footer">
        <div className="footer-top">
          <div>
            <img src={logo} alt="Legal Space" className="footer-logo" />
            <p className="footer-tagline">{t.footer.tagline}</p>
          </div>
          <div className="footer-badges">
            <span className="footer-badge"><HiOutlineLockClosed size={12} /> {t.footer.badges[0]}</span>
            <span className="footer-badge"><HiOutlineShieldCheck size={12} /> {t.footer.badges[1]}</span>
            <span className="footer-badge"><HiOutlineGlobe size={12} /> {t.footer.badges[2]}</span>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">{t.footer.copy}</span>
          <div className="lang-toggle">
            <button className={lang === 'en' ? 'lang-btn active' : 'lang-btn'} onClick={() => setLang('en')}>EN</button>
            <button className={lang === 'fr' ? 'lang-btn active' : 'lang-btn'} onClick={() => setLang('fr')}>FR</button>
          </div>
        </div>
      </footer>

    </div>
  );
}