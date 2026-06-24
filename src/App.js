import React, { useState, useEffect, useRef, useMemo } from 'react';
import './App.css';
import BlurText from './components/BlurText';
import MagicBento from './components/MagicBento';
import { BrowserRouter, Switch, Route, Link } from 'react-router-dom';
import FlowFade from './components/FlowFade';
import BookACall from './components/BookACall';
import { LenisProvider, useLenis } from './components/LenisContext';
import GlobeCanvas from './components/GlobeCanvas';
import {
  HiOutlineDocumentText,
  HiOutlineSparkles,
  HiOutlineMailOpen,
  HiOutlinePencilAlt,
  HiOutlineLockClosed,
  HiOutlineShieldCheck,
  HiOutlineArrowRight,
  HiOutlinePhone,
  HiOutlineLightningBolt,
  HiOutlineGlobe,
  HiOutlineCog,
  HiOutlineExclamationCircle,
  HiOutlineServer,
  HiOutlineEyeOff,
  HiOutlineClipboardCheck,
  HiOutlineClock,
  HiOutlineBadgeCheck,
} from 'react-icons/hi';

// ─── HOOKS: scroll-driven hero + reveal on view ────────────────────────────────
// Era: useState + setProgress la fiecare scroll tick — asta re-randa tot
// AppInner (părintele lui ScrollStack) de fiecare dată când Lenis mișca
// scroll-ul, chiar dacă props-urile transmise mai jos rămâneau identice.
// Pe dispozitive mai lente, acel re-render pass concura cu propriul RAF al
// lui Lenis și cu updateCardTransforms() din ScrollStack pentru timp de
// CPU în același frame — sărind/întârziind unele frame-uri de translateY,
// perceput vizual ca smucitură sus-jos la scroll, nu ca micro-jitter de
// sub-pixel (asta era deja reparat separat).
// Fix: scrie direct pe stilul DOM-ului prin ref, fără să treacă niciodată
// prin React state — niciun re-render declanșat, deci ScrollStack nu mai
// concurează cu acest hook pentru ciclul de RAF.
function useHeroScrollProgress(ref) {
  useEffect(() => {
    let raf = null;
    const handle = () => {
      const heroEl = document.querySelector('.hero');
      const el = ref.current;
      if (!heroEl || !el) return;
      const h = heroEl.offsetHeight;
      const p = Math.min(Math.max(window.scrollY / (h * 0.8), 0), 1);
      el.style.transform = `translateY(${p * -40}px) scale(${1 - p * 0.45})`;
      el.style.opacity = String(1 - p * 0.5);
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { handle(); raf = null; });
    };
    handle();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [ref]);
}

function useInView(threshold = 0.25) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

// ─── HELPER: render title with *italic* markup ─────────────────────────────────
function EmTitle({ text, as = 'h2', className = '', blur = false, delay = 80 }) {
  const Tag = as;
  if (blur) {
    return (
      <BlurText
        text={text}
        as={as}
        className={className}
        animateBy="words"
        direction="top"
        delay={delay}
        stepDuration={0.3}
      />
    );
  }
  const parts = text.split(/\*(.+?)\*/g);
  return (
    <Tag className={className}>
      {parts.map((part, i) => (i % 2 === 1 ? <em key={i}>{part}</em> : part))}
    </Tag>
  );
}

// ─── NAV LINK: smooth-scrolls via the shared Lenis instance instead of a
//     native <a href="#..."> jump, so it never fights the global Lenis RAF
//     loop (see LenisContext.jsx). Falls back to scrollIntoView if Lenis
//     hasn't registered yet (e.g. clicked during initial page load). ─────────
function NavScrollLink({ targetId, children, className }) {
  const { scrollTo } = useLenis();

  const handleClick = e => {
    e.preventDefault();
    const target = document.querySelector(targetId);
    if (!target) return;
    scrollTo(target, { offset: -80 }); // offset clears the fixed nav height
  };

  return (
    <a href={targetId} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}

// ─── THE FLOW (signature element) ──────────────────────────────────────────────
const flowSteps = {
  en: [
    {
      num: '01', key: 'generate', title: 'Generate',
      verb: 'Fill a form.', result: 'Get a contract.',
      desc: 'Pick a template, complete a short form with the deal details, and the contract drafts itself - clauses, names, and figures already in place.',
      Icon: HiOutlineDocumentText,
    },
    {
      num: '02', key: 'review', title: 'Review',
      verb: 'AI reads it first.', result: 'You see what matters.',
      desc: 'Before anyone signs off, the AI flags missing clauses, risky terms, and inconsistencies - so the review meeting is about decisions, not proofreading.',
      Icon: HiOutlineSparkles,
    },
    {
      num: '03', key: 'approve', title: 'Approve',
      verb: 'One email.', result: 'One click.',
      desc: 'The approver gets a plain-language summary and a secure link. No login, no attachment to hunt for - approve or send it back in seconds.',
      Icon: HiOutlineMailOpen,
    },
    {
      num: '04', key: 'sign', title: 'Sign',
      verb: 'Send to signature.', result: 'Legally done.',
      desc: 'Once approved, the contract moves straight to e-signature. Every party signs, every step is logged, and the final PDF lands wherever you need it.',
      Icon: HiOutlinePencilAlt,
    },
  ],
  fr: [
    {
      num: '01', key: 'generate', title: 'Générer',
      verb: 'Remplissez un formulaire.', result: 'Obtenez un contrat.',
      desc: 'Choisissez un modèle, complétez un court formulaire avec les détails - le contrat se rédige seul, clauses, noms et montants déjà en place.',
      Icon: HiOutlineDocumentText,
    },
    {
      num: '02', key: 'review', title: 'Vérifier',
      verb: "L'IA lit en premier.", result: "Vous voyez l'essentiel.",
      desc: "Avant toute validation, l'IA signale les clauses manquantes, les termes à risque et les incohérences - la réunion de relecture devient une décision, pas une chasse aux erreurs.",
      Icon: HiOutlineSparkles,
    },
    {
      num: '03', key: 'approve', title: 'Approuver',
      verb: 'Un email.', result: 'Un clic.',
      desc: "L'approbateur reçoit un résumé clair et un lien sécurisé. Pas de connexion, pas de pièce jointe à chercher - approuvez ou renvoyez en quelques secondes.",
      Icon: HiOutlineMailOpen,
    },
    {
      num: '04', key: 'sign', title: 'Signer',
      verb: 'Envoyé à la signature.', result: 'Juridiquement finalisé.',
      desc: "Une fois approuvé, le contrat part directement en signature électronique. Chaque étape est journalisée, le PDF final arrive où vous en avez besoin.",
      Icon: HiOutlinePencilAlt,
    },
  ],
};

// ─── FEATURES (outcomes, not jargon) ───────────────────────────────────────────
const features = {
  en: [
    {
      Icon: HiOutlineDocumentText, name: 'Drafting *made effortless*',
      outcome: 'Build once, reuse for every NDA, every services agreement, every renewal.',
      bullets: ['Reusable template builder', 'Live editor, built in', 'Word Online for M365 teams'],
    },
    {
      Icon: HiOutlineSparkles, name: '*AI-powered* risk review',
      outcome: 'Catches missing clauses and risky terms before a human has to.',
      bullets: ['Clause gap detection', 'Plain-language risk score', 'Flags before approval, not after'],
    },
    {
      Icon: HiOutlineMailOpen, name: 'Approvals *from the inbox*',
      outcome: 'Approvers act from their inbox - no new tool to learn, no account to create.',
      bullets: ['One-click email approval', 'No login required', 'Secure, time-limited links'],
    },
    {
      Icon: HiOutlineBadgeCheck, name: 'Signed *and accounted for*',
      outcome: 'Legally binding signatures, triggered the moment approval lands.',
      bullets: ['E-signature on approval', 'Full audit trail', 'Timestamped, traceable history'],
    },
  ],
  fr: [
    {
      Icon: HiOutlineDocumentText, name: 'La rédaction *simplifiée*',
      outcome: 'Créez une fois, réutilisez pour chaque NDA, chaque prestation, chaque renouvellement.',
      bullets: ['Modèles réutilisables', 'Édition en direct intégrée', 'Word Online pour les équipes M365'],
    },
    {
      Icon: HiOutlineSparkles, name: 'Analyse des risques *par IA*',
      outcome: 'Détecte les clauses manquantes et les termes à risque avant la relecture humaine.',
      bullets: ['Détection des clauses manquantes', 'Score de risque clair', 'Signalé avant approbation'],
    },
    {
      Icon: HiOutlineMailOpen, name: 'Approbation *depuis la boîte mail*',
      outcome: 'Les approbateurs agissent depuis leur boîte mail - aucun outil à apprendre.',
      bullets: ['Approbation en un clic', 'Aucune connexion requise', 'Liens sécurisés et limités dans le temps'],
    },
    {
      Icon: HiOutlineBadgeCheck, name: 'Signé *et tracé*',
      outcome: 'Signatures juridiquement valides, déclenchées dès l\'approbation reçue.',
      bullets: ['Signature électronique automatique', 'Piste d\'audit complète', 'Historique horodaté et traçable'],
    },
  ],
};

// ─── CONTENT ──────────────────────────────────────────────────────────────────
const content = {
  en: {
    nav: { flow: 'How it works', features: 'Features', security: 'Security', cta: 'Book a call' },
    hero: {
      eyebrow: 'Contract Lifecycle Management',
      h1a: 'From blank page',
      h1b: 'to signed contract.',
      p: 'One platform to draft, review, approve, and sign your contracts - with AI doing the reading so your team can do the deciding.',
      btn1: 'Book a discovery call',
      btn2: 'See how it works',
      stat1n: '4 steps', stat1l: 'start to signature',
      stat2n: 'EU', stat2l: 'data residency',
      stat3n: 'Minutes', stat3l: 'not weeks, to approve',
    },
    why_now: {
      eyebrow: 'The problem today',
      title: 'Your contracts live in *email threads* and Word attachments',
      sub: 'Versions get lost. Approvals sit unread. Risk slips through because no one had time to read clause 14 again.',
      pains: [
        { stat: '65%', label: 'of contract renewals are missed or delayed due to manual tracking' },
        { stat: '12h', label: 'lost per week chasing approvals and re-reading the same clauses' },
        { stat: '3×', label: 'longer signing cycles when signature is a separate, disconnected step' },
      ],
      cta: 'See the fix',
    },
    flow: {
      eyebrow: 'The platform',
      title: 'One path. Four steps. *Zero lost emails.*',
      sub: 'Every contract follows the same clear route - click a step to see it in action.',
    },
    features: {
      eyebrow: 'What\'s inside',
      title: 'Everything a contract needs to *get signed*',
      sub: 'No bolt-ons, no separate tools to stitch together.',
    },
    security: {
      eyebrow: 'Data protection & IT security',
      title: 'Your contracts are sensitive. *We treat them that way.*',
      sub: 'Security isn\'t a feature we added - it\'s the reason the platform is shaped the way it is.',
      items: [
        { Icon: HiOutlineServer, title: 'EU-hosted', desc: 'Your documents are stored on European infrastructure, built for GDPR from day one.' },
        { Icon: HiOutlineLockClosed, title: 'Encrypted, always', desc: 'In transit and at rest. Role-based access means people only see what they\'re meant to.' },
        { Icon: HiOutlineEyeOff, title: 'AI that doesn\'t wander', desc: 'The AI reads the document in front of it to do its job. Nothing is used to train external models.' },
        { Icon: HiOutlineClipboardCheck, title: 'Audit-ready', desc: 'Every action logged, every approval traced. Ready the day someone asks "who approved this, and when?"' },
      ],
    },
    why: {
      eyebrow: 'Why this platform',
      title: 'Built to fit *how you already work*',
      items: [
        { Icon: HiOutlineCog, title: 'Configured to your flow', desc: 'Need a second approval step for high-value contracts? It\'s a setting, not a six-month project.' },
        { Icon: HiOutlineLightningBolt, title: 'Live in weeks', desc: 'No procurement marathon. Most teams are drafting their first contract within days of onboarding.' },
        { Icon: HiOutlineGlobe, title: 'Works in your language', desc: 'French, English, Romanian - the platform speaks your team\'s language, not just ours.' },
        { Icon: HiOutlineExclamationCircle, title: 'Honest about scope', desc: 'This is contract lifecycle management, done properly - not a bloated suite pretending to do everything.' },
      ],
    },
    footer: {
      tagline: 'Contracts, from draft to signature, without the chaos.',
      badges: ['EU data residency', 'GDPR compliant', 'Multilingual team'],
      copy: '© 2026',
    },
  },
  fr: {
    nav: { flow: 'Fonctionnement', features: 'Fonctionnalités', security: 'Sécurité', cta: 'Prendre rendez-vous' },
    hero: {
      eyebrow: 'Gestion du cycle de vie des contrats',
      h1a: 'De la page blanche',
      h1b: 'au contrat signé.',
      p: 'Une seule plateforme pour rédiger, vérifier, approuver et signer vos contrats - l\'IA s\'occupe de la lecture, votre équipe se concentre sur la décision.',
      btn1: 'Prendre un premier appel',
      btn2: 'Voir le fonctionnement',
      stat1n: '4 étapes', stat1l: 'du début à la signature',
      stat2n: 'EU', stat2l: 'résidence des données',
      stat3n: 'Minutes', stat3l: 'et non des semaines, pour approuver',
    },
    why_now: {
      eyebrow: "Le problème aujourd'hui",
      title: 'Vos contrats vivent dans des *emails et des pièces jointes* Word',
      sub: 'Les versions se perdent. Les approbations restent non lues. Le risque passe parce que personne n\'a relu la clause 14.',
      pains: [
        { stat: '65%', label: 'des renouvellements de contrats sont manqués ou retardés faute de suivi automatisé' },
        { stat: '12h', label: 'perdues par semaine à relancer les approbations et relire les mêmes clauses' },
        { stat: '3×', label: 'plus de temps de signature quand celle-ci reste une étape séparée et déconnectée' },
      ],
      cta: 'Voir la solution',
    },
    flow: {
      eyebrow: 'La plateforme',
      title: 'Un parcours. Quatre étapes. *Zéro email perdu.*',
      sub: 'Chaque contrat suit le même chemin clair - cliquez sur une étape pour la voir en action.',
    },
    features: {
      eyebrow: 'Ce qui est inclus',
      title: 'Tout ce qu\'il faut pour *faire signer un contrat*',
      sub: 'Pas de modules annexes, pas d\'outils séparés à assembler.',
    },
    security: {
      eyebrow: 'Protection des données & sécurité IT',
      title: 'Vos contrats sont sensibles. *Nous les traitons comme tels.*',
      sub: 'La sécurité n\'est pas une fonctionnalité ajoutée - c\'est la raison pour laquelle la plateforme est construite ainsi.',
      items: [
        { Icon: HiOutlineServer, title: 'Hébergé en EU', desc: 'Vos documents sont stockés sur une infrastructure européenne, conçue pour le RGPD dès le départ.' },
        { Icon: HiOutlineLockClosed, title: 'Toujours chiffré', desc: 'En transit et au repos. L\'accès basé sur les rôles garantit que chacun ne voit que ce qu\'il doit voir.' },
        { Icon: HiOutlineEyeOff, title: 'Une IA qui reste concentrée', desc: 'L\'IA lit le document pour faire son travail. Rien n\'est utilisé pour entraîner des modèles externes.' },
        { Icon: HiOutlineClipboardCheck, title: 'Prêt pour l\'audit', desc: 'Chaque action journalisée, chaque approbation tracée. Prêt le jour où l\'on demande "qui a approuvé, et quand ?"' },
      ],
    },
    why: {
      eyebrow: 'Pourquoi cette plateforme',
      title: 'Conçue pour s\'adapter à *votre façon de travailler*',
      items: [
        { Icon: HiOutlineCog, title: 'Configurée sur votre flux', desc: 'Besoin d\'une seconde approbation pour les contrats importants ? C\'est un réglage, pas un projet de six mois.' },
        { Icon: HiOutlineLightningBolt, title: 'Opérationnelle en semaines', desc: 'Pas de marathon d\'achat. La plupart des équipes rédigent leur premier contrat quelques jours après l\'intégration.' },
        { Icon: HiOutlineGlobe, title: 'Dans votre langue', desc: 'Français, anglais, roumain - la plateforme parle la langue de votre équipe.' },
        { Icon: HiOutlineExclamationCircle, title: 'Honnêtes sur le périmètre', desc: 'C\'est de la gestion de contrats, faite correctement - pas une suite tentaculaire qui promet de tout faire.' },
      ],
    },
    footer: {
      tagline: 'Des contrats, du brouillon à la signature, sans le chaos.',
      badges: ['Hébergement EU', 'Conforme RGPD', 'Équipe multilingue'],
      copy: '© 2026',
    },
  },
};

// ─── ANIMATED WIDGETS — one per flow step ──────────────────────────────────────

function useTypedText(fullText, speed = 28, active) {
  const [text, setText] = useState('');
  useEffect(() => {
    if (!active) { setText(''); return; }
    let i = 0;
    setText('');
    const id = setInterval(() => {
      i += 1;
      setText(fullText.slice(0, i));
      if (i >= fullText.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [fullText, speed, active]);
  return text;
}

function GenerateWidget({ active, lang }) {
  const company = useTypedText('Atlas Robotics SRL', 35, active);
  const value = useTypedText(lang === 'fr' ? '48 000 €' : '€48,000', 60, active);
  const term = useTypedText(lang === 'fr' ? '12 mois' : '12 months', 60, active);
  const labels = lang === 'fr'
    ? { client: 'Client', value: 'Valeur du contrat', term: 'Durée', doc: 'Contrat_Prestation_v1.docx', generating: 'Génération en cours…' }
    : { client: 'Client', value: 'Contract value', term: 'Term', doc: 'Services_Agreement_v1.docx', generating: 'Generating…' };

  return (
    <div className={active ? 'widget widget-generate' : 'widget widget-generate widget--paused'}>
      <div className="widget-window">
        <div className="widget-titlebar">
          <span className="widget-dot widget-dot--red" />
          <span className="widget-dot widget-dot--yellow" />
          <span className="widget-dot widget-dot--green" />
          <span className="widget-filename">{labels.doc}</span>
        </div>
        <div className="widget-form">
          <div className="widget-field">
            <span className="widget-field-label">{labels.client}</span>
            <span className="widget-field-value">{company}<span className="widget-caret" /></span>
          </div>
          <div className="widget-field">
            <span className="widget-field-label">{labels.value}</span>
            <span className="widget-field-value">{value}<span className="widget-caret" /></span>
          </div>
          <div className="widget-field">
            <span className="widget-field-label">{labels.term}</span>
            <span className="widget-field-value">{term}<span className="widget-caret" /></span>
          </div>
        </div>
        <div className="widget-doc-preview">
          <div className="widget-doc-line" style={{ width: '88%', animationDelay: '0.1s' }} />
          <div className="widget-doc-line" style={{ width: '94%', animationDelay: '0.25s' }} />
          <div className="widget-doc-line" style={{ width: '70%', animationDelay: '0.4s' }} />
          <div className="widget-doc-line widget-doc-line--gen" style={{ animationDelay: '0.55s' }}>
            <span className="widget-spinner" />{labels.generating}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewWidget({ active, lang }) {
  const [score, setScore] = useState(0);
  const [flagsShown, setFlagsShown] = useState(0);
  const flags = useMemo(() => (
    lang === 'fr'
      ? [
          { sev: 'high', text: 'Clause de résiliation manquante' },
          { sev: 'mid', text: 'Pénalité de retard non chiffrée' },
          { sev: 'low', text: 'Juridiction non précisée' },
        ]
      : [
          { sev: 'high', text: 'Missing termination clause' },
          { sev: 'mid', text: 'Late-payment penalty unspecified' },
          { sev: 'low', text: 'Governing jurisdiction not stated' },
        ]
  ), [lang]);
  const labelRisk = lang === 'fr' ? 'Score de risque' : 'Risk score';

  useEffect(() => {
    if (!active) { setScore(0); setFlagsShown(0); return; }
    const target = 64;
    let cur = 0;
    const scoreId = setInterval(() => {
      cur += 4;
      setScore(Math.min(cur, target));
      if (cur >= target) clearInterval(scoreId);
    }, 30);
    const flagTimers = flags.map((_, i) => setTimeout(() => setFlagsShown(i + 1), 600 + i * 380));
    return () => { clearInterval(scoreId); flagTimers.forEach(clearTimeout); };
  }, [active, flags]);

  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={active ? 'widget widget-review' : 'widget widget-review widget--paused'}>
      <div className="widget-review-top">
        <svg width="100" height="100" viewBox="0 0 100 100" className="widget-gauge">
          <circle cx="50" cy="50" r="42" className="widget-gauge-track" />
          <circle
            cx="50" cy="50" r="42"
            className="widget-gauge-fill"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
          <text x="50" y="46" className="widget-gauge-num">{score}</text>
          <text x="50" y="63" className="widget-gauge-label">/100</text>
        </svg>
        <div className="widget-review-label">{labelRisk}</div>
      </div>
      <div className="widget-flags">
        {flags.map((f, i) => (
          <div key={i} className={i < flagsShown ? `widget-flag widget-flag--${f.sev} widget-flag--in` : `widget-flag widget-flag--${f.sev}`}>
            <span className="widget-flag-dot" />
            <span>{f.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ApproveWidget({ active, lang }) {
  const [phase, setPhase] = useState(0); // 0 idle, 1 cursor moving, 2 clicked/approved
  const labels = lang === 'fr'
    ? { subject: 'Approbation requise — Contrat_Prestation_v1', from: 'plateforme@contrats.eu', summary: 'Résumé : prestation de services, 12 mois, 48 000 €. 1 risque moyen détecté.', approve: 'Approuver', approved: 'Approuvé' }
    : { subject: 'Approval needed — Services_Agreement_v1', from: 'platform@contracts.eu', summary: 'Summary: services agreement, 12 months, €48,000. 1 medium risk flagged.', approve: 'Approve', approved: 'Approved' };

  useEffect(() => {
    if (!active) { setPhase(0); return; }
    const t1 = setTimeout(() => setPhase(1), 500);
    const t2 = setTimeout(() => setPhase(2), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [active]);

  return (
    <div className={active ? 'widget widget-approve' : 'widget widget-approve widget--paused'}>
      <div className="widget-window">
        <div className="widget-titlebar">
          <span className="widget-dot widget-dot--red" />
          <span className="widget-dot widget-dot--yellow" />
          <span className="widget-dot widget-dot--green" />
          <span className="widget-filename">{labels.from}</span>
        </div>
        <div className="widget-email">
          <div className="widget-email-subject">{labels.subject}</div>
          <p className="widget-email-summary">{labels.summary}</p>
          <div className="widget-email-btn-row">
            <button className={phase >= 2 ? 'widget-approve-btn widget-approve-btn--done' : 'widget-approve-btn'} tabIndex={-1}>
              {phase >= 2 ? (
                <>
                  <svg className="widget-check" viewBox="0 0 24 24" width="16" height="16">
                    <path d="M4 12l5 5L20 6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {labels.approved}
                </>
              ) : labels.approve}
            </button>
          </div>
          <div className={phase === 1 ? 'widget-cursor widget-cursor--move' : phase >= 2 ? 'widget-cursor widget-cursor--click' : 'widget-cursor'}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
              <path d="M5 3l14 8-6 1.5L11 19z" fill="#0f1f3d" stroke="white" strokeWidth="1" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function SignWidget({ active, lang }) {
  const [stamped, setStamped] = useState(false);
  useEffect(() => {
    if (!active) { setStamped(false); return; }
    const t = setTimeout(() => setStamped(true), 1500);
    return () => clearTimeout(t);
  }, [active]);
  const labels = lang === 'fr'
    ? { doc: 'Contrat_Prestation_FINAL.pdf', name: 'Alexandra Dubois', signed: 'SIGNÉ' }
    : { doc: 'Services_Agreement_FINAL.pdf', name: 'Alexandra Dubois', signed: 'SIGNED' };

  return (
    <div className={active ? 'widget widget-sign' : 'widget widget-sign widget--paused'}>
      <div className="widget-window widget-window--paper">
        <div className="widget-titlebar">
          <span className="widget-dot widget-dot--red" />
          <span className="widget-dot widget-dot--yellow" />
          <span className="widget-dot widget-dot--green" />
          <span className="widget-filename">{labels.doc}</span>
        </div>
        <div className="widget-paper">
          <div className="widget-doc-line" style={{ width: '92%' }} />
          <div className="widget-doc-line" style={{ width: '80%' }} />
          <div className="widget-doc-line" style={{ width: '86%' }} />
          <div className="widget-sig-block">
            <svg viewBox="0 0 220 70" className="widget-sig-svg" key={active ? 'on' : 'off'}>
              <path
                d="M10,50 C20,15 30,55 42,30 C50,15 55,45 65,35 C75,25 80,50 95,30 C105,18 115,45 130,32 C140,24 150,40 165,28 C175,20 185,38 205,22"
                fill="none" stroke="#27509b" strokeWidth="2.5" strokeLinecap="round"
                className={active ? 'widget-sig-path widget-sig-path--draw' : 'widget-sig-path'}
              />
            </svg>
            <span className="widget-sig-name">{labels.name}</span>
          </div>
          <div className={stamped ? 'widget-stamp widget-stamp--in' : 'widget-stamp'}>
            {labels.signed}
          </div>
        </div>
      </div>
    </div>
  );
}

function FlowStackCard({ step, lang }) {
  const ref = useRef(null);
  const [inFocus, setInFocus] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInFocus(entry.isIntersecting),
      { threshold: 0.55 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="stack-card-inner" ref={ref}>
      <div className="stack-card-text">
        <div className="stack-card-icon">
          <step.Icon size={26} />
        </div>
        <span className="stack-card-num">{step.num}</span>
        <div className="flow-stage-verbs">
          <span className="flow-stage-verb">{step.verb}</span>
          <HiOutlineArrowRight size={16} color="#9fb3d6" />
          <span className="flow-stage-result">{step.result}</span>
        </div>
        <p className="flow-stage-desc">{step.desc}</p>
      </div>
      <div className="flow-stage-widget">
        <FlowWidget stepKey={step.key} active={inFocus} lang={lang} />
      </div>
    </div>
  );
}

function FlowWidget({ stepKey, active, lang }) {
  switch (stepKey) {
    case 'generate': return <GenerateWidget active={active} lang={lang} />;
    case 'review': return <ReviewWidget active={active} lang={lang} />;
    case 'approve': return <ApproveWidget active={active} lang={lang} />;
    case 'sign': return <SignWidget active={active} lang={lang} />;
    default: return null;
  }
}

// ─── APP ──────────────────────────────────────────────────────────────────────
function AppInner() {
  const [lang, setLang] = useState('en');
  const t = content[lang];
  const feats = features[lang];
  const steps = flowSteps[lang];

  React.useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const heroSphereRef = useRef(null);
  useHeroScrollProgress(heroSphereRef);
  const [flowRef, flowInView] = useInView(0.2);
  const [whyRef, whyInView] = useInView(0.2);
  const [securityIndex, setSecurityIndex] = useState(0);
  const securityItems = t.security.items;

  useEffect(() => {
    const id = setInterval(() => {
      setSecurityIndex((i) => (i + 1) % securityItems.length);
    }, 4200);
    return () => clearInterval(id);
  }, [securityItems.length]);

  return (
    <div className="App">

      {/* ── NAV ── */}
      <nav className="nav">
        <span className="nav-wordmark">Legal name</span>
        <ul className="nav-links">
          <li><NavScrollLink targetId="#flow">{t.nav.flow}</NavScrollLink></li>
          <li><NavScrollLink targetId="#features">{t.nav.features}</NavScrollLink></li>
          <li><NavScrollLink targetId="#security">{t.nav.security}</NavScrollLink></li>
        </ul>
        <div className="nav-right">
          <div className="lang-toggle">
            <button className={lang === 'en' ? 'lang-btn active' : 'lang-btn'} onClick={() => setLang('en')}>EN</button>
            <button className={lang === 'fr' ? 'lang-btn active' : 'lang-btn'} onClick={() => setLang('fr')}>FR</button>
          </div>
          <NavScrollLink targetId="#contact" className="btn-primary btn-sm">{t.nav.cta}</NavScrollLink>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-curve hero-curve--top" />
        <div className="hero-curve hero-curve--bottom" />
        <div className="hero-content hero-content--center">

          <div
            className="hero-sphere-wrap"
            ref={heroSphereRef}
          >
            <div className="hero-sphere">
              <div className="hero-sphere-glow" />
              <GlobeCanvas maxSize={200} />
              <div className="hero-sphere-spark" style={{ top: '22%', left: '28%' }} />
              <div className="hero-sphere-spark" style={{ top: '58%', left: '64%' }} />
              <div className="hero-sphere-spark" style={{ top: '40%', left: '70%' }} />
            </div>
          </div>

          <BlurText
            text={`${t.hero.h1a} *${t.hero.h1b}*`}
            as="h1"
            className="hero-h1-center"
            animateBy="words"
            direction="top"
            delay={90}
            stepDuration={0.32}
          />
          <p className="hero-p-center">{t.hero.p}</p>
          <div className="hero-actions hero-actions--center">
            <NavScrollLink targetId="#contact" className="btn-primary">
              {t.hero.btn1} <HiOutlineArrowRight style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
            </NavScrollLink>
            <NavScrollLink targetId="#flow" className="btn-outline">{t.hero.btn2}</NavScrollLink>
          </div>
          <div className="hero-stats hero-stats--center">
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
      </section>

      {/* ── WHY NOW ── */}
      <section className="why-now-section" id="why-now">
        <div className="why-now-inner">
          <div className="why-now-header">
            <span className="section-eyebrow">{t.why_now.eyebrow}</span>
            <EmTitle text={t.why_now.title} className="section-title" blur />
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
            <NavScrollLink targetId="#flow" className="btn-primary">
              {t.why_now.cta} <HiOutlineArrowRight style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
            </NavScrollLink>
          </div>
        </div>
      </section>

      {/* ── THE FLOW (signature element) ── */}
      <section className="flow-section" id="flow" ref={flowRef}>
        <div className={flowInView ? 'flow-inner flow-inner--revealed' : 'flow-inner'}>
          <div className="section-header">
            <span className="section-eyebrow">{t.flow.eyebrow}</span>
            <EmTitle text={t.flow.title} className="section-title" blur />
            <p className="section-sub">{t.flow.sub}</p>
          </div>

          <FlowFade
            steps={steps}
            renderCard={(step) => <FlowStackCard step={step} lang={lang} />}
          />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="features-section" id="features">
        <div className="section-header">
          <span className="section-eyebrow">{t.features.eyebrow}</span>
          <EmTitle text={t.features.title} className="section-title" blur />
          <p className="section-sub">{t.features.sub}</p>
        </div>
        <MagicBento
          cardData={feats.map((f, i) => ({
            Icon: f.Icon,
            label: lang === 'en' ? `Step ${i + 1}` : `Étape ${i + 1}`,
            title: <EmTitle text={f.name} as="span" />,
            description: f.outcome,
          }))}
          textAutoHide={true}
          enableStars={true}
          enableSpotlight={true}
          enableBorderGlow={true}
          enableTilt={true}
          enableMagnetism={true}
          clickEffect={true}
          spotlightRadius={280}
          particleCount={8}
          glowColor="0, 33, 142"
        />
      </section>

      {/* ── SECURITY ── */}
      <section className="security-section" id="security">
        <div className="security-inner">
          <div className="section-header">
            <span className="section-eyebrow">{t.security.eyebrow}</span>
            <EmTitle text={t.security.title} className="section-title" blur />
            <p className="section-sub">{t.security.sub}</p>
          </div>
          <div className="security-carousel">
            <div className="security-track-wrap">
              <div
                className="security-track"
                style={{ transform: `translateX(calc(50% - ${securityIndex * 100}% - 50%))` }}
              >
                {securityItems.map((s, i) => {
                  const offset = i - securityIndex;
                  return (
                    <div
                      className={offset === 0 ? 'security-slide security-slide--active' : 'security-slide'}
                      key={i}
                    >
                      <div className="security-card">
                        <div className="security-icon-wrap">
                          <s.Icon size={24} color="white" />
                        </div>
                        <h3>{s.title}</h3>
                        <p>{s.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="security-dots">
              {securityItems.map((_, i) => (
                <button
                  key={i}
                  className={i === securityIndex ? 'security-dot security-dot--active' : 'security-dot'}
                  onClick={() => setSecurityIndex(i)}
                  aria-label={`slide-${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className="why-section" id="about" ref={whyRef}>
        <div className={whyInView ? 'why-inner why-inner--revealed' : 'why-inner'}>
          <div className="why-left">
            <span className="section-eyebrow">{t.why.eyebrow}</span>
            <EmTitle text={t.why.title} className="section-title section-title--left" blur />
          </div>
          <div className="why-grid">
            {t.why.items.map((w, i) => (
              <div className="why-card" key={i} style={{ transitionDelay: `${i * 90}ms` }}>
                <span className="why-card-num">{String(i + 1).padStart(2, '0')}</span>
                <div className="why-icon-wrap">
                  <w.Icon size={22} />
                </div>
                <h3>{w.title}</h3>
                <p>{w.desc}</p>
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
              ? 'Book a 30-minute discovery call. No pitch, just a conversation about your contracts and what would actually help.'
              : 'Réservez un appel de découverte de 30 minutes. Pas de discours commercial - juste une conversation sur vos contrats.'
            }</p>
          </div>
          <Link to="/book-a-call" className="btn-white">
            {t.nav.cta} <HiOutlineArrowRight style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer" id="footer">
        <div className="footer-top">
          <div>
            <span className="footer-wordmark">Legal name</span>
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

// LenisProvider exposes scrollTo (used by NavScrollLink) via context.
// Lenis itself was removed along with ScrollStack — scrollTo now drives
// native scrollIntoView/window.scrollTo with smooth behavior, no external
// scroll library involved.
export default function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route
          exact
          path="/"
          render={() => (
            <LenisProvider>
              <AppInner />
            </LenisProvider>
          )}
        />
        <Route path="/book-a-call" component={BookACall} />
      </Switch>
    </BrowserRouter>
  );
}