"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent, type CSSProperties } from "react";
import { Icon } from "./Icons";

type ProjectId = "hassel" | "invaro" | "qabas" | "sanad";
type Category = "all" | "products" | "websites";
type Project = {
  id: ProjectId; name: string; label: string; category: Exclude<Category, "all">;
  description: string; period?: string; stack: string[]; features: string[];
  live?: string; domain?: string;
};
const projects: Project[] = [
  {
    id: "hassel", name: "Hassel", label: "Property management SaaS", category: "products", period: "2026 — Present",
    description: "An all-in-one property management platform for organizing rent collection, leases, expenses, and maintenance. Hassel brings day-to-day operations together with a tenant portal and a WhatsApp AI assistant, so tenants can get help and take action through the channel they already use.",
    stack: ["Next.js", "Python", "PostgreSQL", "Vercel Blob", "OpenAI", "Meta WhatsApp Business", "Resend", "Vercel"],
    features: [
      "Manage rent payments, leases, expenses, unit maintenance, and other property operations in one workspace.",
      "Role-based access gives organization teams, including managers and finance staff, access to the information relevant to their work; a dedicated tenant portal lets residents follow leases and payments.",
      "A custom AI agent connects the main web application to WhatsApp. Tenants can submit payment receipts for verification and recording, request maintenance, and get answers based on their account information.",
      "WhatsApp payment reminders and a shared support inbox help teams follow up and handle tenant conversations.",
      "The main application is built with Next.js, while the WhatsApp AI agent runs separately in Python. PostgreSQL stores application data and Vercel Blob stores files.",
      "Integrates OpenAI, Meta WhatsApp Business, and Resend.",
    ],
    live: "https://hassel.website/", domain: "hassel.website",
  },
  {
    id: "invaro", name: "Invaro", label: "Event management platform", category: "products", period: "Final-year project / 2025",
    description: "An event management platform that brings event details, guest lists, invitations, and guest responses together. Organizers can create an event, import and organize its guests, and follow each invitation through RSVP and venue check-in.",
    stack: ["Laravel", "PHP", "SQLite", "MySQL-ready migration", "Google Cloud", "Gemini", "Twilio", "WhatsApp"],
    features: [
      "Create an event and manage its details, guest list, invitation delivery, RSVP responses, guest count, and check-in status from one event page.",
      "Import guests from Google Contacts, Google Sheets, and Excel files.",
      "Use the built-in Gemini assistant to draft personalized invitations, with multilingual support so guests can receive messages in their preferred language.",
      "Give each guest a QR code that works as an event ticket for entry and check-in.",
      "Google Cloud integrations support login, contacts, and Sheets; Twilio supports WhatsApp messaging.",
      "Built with Laravel and PHP using SQLite, with a migration path prepared for MySQL.",
    ],
  },
  {
    id: "qabas", name: "Qabas", label: "Qabas Marketing Agency profile", category: "websites",
    description: "A company profile website for Qabas Marketing Agency in Riyadh. It introduces the agency, presents its brand and services, and gives prospective clients a clear way to get in touch.",
    stack: ["Next.js", "React", "TypeScript", "CSS"],
    features: ["Company profile and brand presentation", "Agency services and contact information", "A direct path for prospective clients to get in touch"],
    live: "https://qabassa.com/", domain: "qabassa.com",
  },
  {
    id: "sanad", name: "Sanad", label: "Online Quran learning platform", category: "products",
    description: "Bringing Quran teachers and students together across the world. Sanad turns online halaqat into an organized learning experience with personalized plans, coordinated sessions, and progress tracking.",
    stack: ["Next.js", "PostgreSQL", "Vercel Blob", "Vercel", "GitHub"],
    features: [
      "Dedicated student and teacher experiences: students manage their learning plans, subscriptions, and classes; teachers share class links and track student progress.",
      "Each student is assigned a teacher and selects session times from that teacher’s availability, preventing overlapping bookings.",
      "Selected surahs are divided evenly across classes, accounting for ayahs and pages to create a balanced learning plan.",
      "Vercel Blob handles object storage, with deployment on Vercel and version control through GitHub.",
    ],
    live: "https://sanad-iota-lake.vercel.app/", domain: "sanad-iota-lake.vercel.app",
  },
];

function HasselCardVideo({ active }: { active: boolean }) {
  const forwardRef = useRef<HTMLVideoElement>(null);
  const reverseRef = useRef<HTMLVideoElement>(null);
  const directionRef = useRef<"forward" | "reverse">("forward");
  const hasPlayedRef = useRef(false);
  const [direction, setDirection] = useState<"forward" | "reverse">("forward");
  useEffect(() => {
    const forward = forwardRef.current, reverse = reverseRef.current;
    if (!forward || !reverse) return;
    forward.pause(); reverse.pause();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || (!active && !hasPlayedRef.current)) return;
    hasPlayedRef.current = true;
    const next = active ? "forward" : "reverse";
    const source = directionRef.current === "forward" ? forward : reverse;
    const destination = active ? forward : reverse;
    const sourceTime = source.currentTime;
    const previousDirection = directionRef.current;
    let cancelled = false;
    let speedAnimation = 0;
    const play = () => {
      if (cancelled) return;
      directionRef.current = next; setDirection(next);
      destination.playbackRate = .65;
      if (destination.currentTime >= destination.duration - 1 / 24) return;
      void destination.play().then(() => {
        if (cancelled) return;
        const started = performance.now();
        const accelerate = (time: number) => {
          speedAnimation = 0;
          if (cancelled || destination.paused) return;
          const progress = Math.min(1, (time - started) / 800);
          const eased = 1 - (1 - progress) ** 3;
          destination.playbackRate = .65 + (1 - .65) * eased;
          if (progress < 1) speedAnimation = requestAnimationFrame(accelerate);
        };
        speedAnimation = requestAnimationFrame(accelerate);
      }).catch(() => {});
    };
    const seek = () => {
      if (cancelled) return;
      const lastFrame = Math.max(0, destination.duration - 1 / 24);
      const time = previousDirection === next ? sourceTime : lastFrame - sourceTime;
      const target = Math.max(0, Math.min(lastFrame, time));
      if (Math.abs(destination.currentTime - target) < .001) play();
      else { destination.addEventListener("seeked", play, { once: true }); destination.currentTime = target; }
    };
    if (destination.readyState >= 1) seek();
    else destination.addEventListener("loadedmetadata", seek, { once: true });
    return () => { cancelled = true; cancelAnimationFrame(speedAnimation); destination.removeEventListener("loadedmetadata", seek); destination.removeEventListener("seeked", play); forward.pause(); reverse.pause(); };
  }, [active]);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stop = () => { if (media.matches || document.hidden) { forwardRef.current?.pause(); reverseRef.current?.pause(); } };
    media.addEventListener("change", stop); document.addEventListener("visibilitychange", stop);
    return () => { media.removeEventListener("change", stop); document.removeEventListener("visibilitychange", stop); };
  }, []);
  return <div className="hassel-card-video" aria-hidden="true">
    <video ref={forwardRef} src="/videos/hassel-desktop-forward-v7.mp4" poster="/videos/hassel-desktop-poster-v7.jpg" muted playsInline preload="auto" hidden={direction !== "forward"} />
    <video ref={reverseRef} src="/videos/hassel-desktop-reverse-v7.mp4" muted playsInline preload="auto" hidden={direction !== "reverse"} />
  </div>;
}

function ProjectVisual({ project, inDialog = false, active = false }: { project: Project; inDialog?: boolean; active?: boolean }) {
  if (project.id === "hassel") {
    return <>
      <div className="visual-brand"><Image src="/projects/hassel-logo-en.png" alt="Hassel" width={364} height={141} className="hassel-project-logo" priority /><span className="live-badge"><i />Live product</span></div>
      <HasselCardVideo active={active} />
      <span className="visual-caption">A closer look at Hassel</span>
    </>;
  }
  if (project.id === "qabas") {
    return <>
      <div className="visual-brand">
        <Image src="/projects/qabas-logo.png" alt="Qabas Marketing" width={650} height={322} className="qabas-wordmark" />
        <span className="live-badge"><i />Live website</span>
      </div>
      {inDialog ? <Image src="/projects/qabas-new-ui.jpg" alt="New Qabas website interface, shown in Arabic" width={1905} height={987} sizes="(max-width: 800px) 95vw, 900px" className="qabas-detail-screenshot" /> : <>
        <div className="qabas-brand-shape" aria-hidden="true"><i /><i /></div>
        <div className="qabas-ui-sheet">
          <Image src="/projects/qabas-new-ui.jpg" alt="Qabas’s Arabic homepage with its bold marketing, content and design typography" width={1905} height={987} sizes="(max-width: 700px) 90vw, 55vw" />
        </div>
        <span className="qabas-language-note" lang="ar">Qabas Marketing Agency</span>
      </>}
      <span className="visual-caption">Qabas Marketing Agency</span>
    </>;
  }
  if (project.id === "invaro") {
    return <>
      <div className="visual-brand"><span className="invaro-mark">invaro<span className="invaro-mark-dot" /></span><span className="visual-category">A better arrival.</span></div>
      {inDialog ? <Image src="/projects/invaro-homepage-v2.png" alt="Invaro homepage: Bring people together. Beautifully." width={1669} height={888} sizes="(max-width: 800px) 95vw, 900px" className="invaro-detail-screenshot" /> : <>
        <div className="invaro-orbit" aria-hidden="true" />
        <div className="invaro-paper-back" aria-hidden="true" />
        <div className="invaro-ui-sheet"><Image src="/projects/invaro-homepage-v2.png" alt="Invaro’s invitation and event management homepage" width={1669} height={888} sizes="(max-width: 700px) 90vw, 45vw" /></div>
        <span className="invaro-journey-caption">Invites <Icon name="arrow-right" /> RSVPs <Icon name="arrow-right" /> Check-ins</span>
      </>}
    </>;
  }
  return <>
    <div className="visual-brand"><Image src="/projects/sanad-logo.png" alt="Sanad Quran learning platform" width={372} height={418} className="sanad-project-logo" priority /><span className="live-badge"><i />Live platform</span></div>
    <div className="project-shot">
      <div className="browser-chrome"><span className="browser-dots"><i /><i /><i /></span><span>{project.domain}</span><Icon name="arrow-up-right" /></div>
      <Image src="/projects/sanad-website.png" alt="Sanad Quran learning platform landing page in Arabic" width={2880} height={1788} sizes={inDialog ? "(max-width: 800px) 95vw, 900px" : "(max-width: 700px) 90vw, 55vw"} className="project-screenshot" />
    </div>
    <span className="visual-caption">Quran learning, wherever you are</span>
  </>;
}

const hasselScreenshots = [
  { src: "/projects/hassel-website.jpg", alt: "Hassel public website landing page", label: "Public website", width: 1440, height: 900 },
  { src: "/projects/hassel-dashboard.jpg", alt: "Hassel property portfolio dashboard", label: "Portfolio dashboard", width: 1440, height: 900 },
  { src: "/projects/hassel-assistant.jpg", alt: "Mohassel real estate assistant chat", label: "AI assistant", width: 924, height: 1186 },
  { src: "/projects/hassel-invoices.jpg", alt: "Hassel financial invoices registry", label: "Financial invoices", width: 1440, height: 899 },
  { src: "/projects/hassel-maintenance.jpg", alt: "Hassel maintenance work orders board", label: "Maintenance tracking", width: 1439, height: 900 },
];

const sanadScreenshots = [
  { src: "/projects/sanad-website.png", alt: "Sanad public Quran learning website in Arabic", label: "Public website", width: 2880, height: 1788 },
  { src: "/projects/sanad-admin.png", alt: "Sanad administration dashboard with subscription reviews, teachers, students, and classes", label: "Administration dashboard", width: 2880, height: 1796 },
  { src: "/projects/sanad-student.png", alt: "Sanad student dashboard with upcoming sessions, learning progress, and class calendar", label: "Student dashboard", width: 2880, height: 1800 },
];

const projectScreenshots = {
  hassel: hasselScreenshots,
  sanad: sanadScreenshots,
  invaro: [{ src: "/projects/invaro-homepage-v2.png", alt: "Invaro event management homepage", label: "Homepage", width: 1669, height: 888 }],
  qabas: [
    { src: "/projects/qabas-new-ui.jpg", alt: "Qabas Marketing Agency company profile homepage", label: "Agency profile", width: 1905, height: 987 },
    { src: "/projects/qabas-content-process.png", alt: "Qabas presentation showing how a single creative idea becomes a message, visual, and finished content", label: "Content production", width: 2880, height: 1628 },
    { src: "/projects/qabas-workflow.png", alt: "Qabas presentation outlining its four step process from understanding the project through final delivery", label: "Project workflow", width: 2880, height: 1612 },
  ],
};

function ProjectScreenshots({ project }: { project: Project }) {
  const screenshots = projectScreenshots[project.id];
  const [active, setActive] = useState(0);
  const [dragX, setDragX] = useState(0);
  const gestureRef = useRef<{ x: number; y: number; pointerId: number } | null>(null);
  const draggedRef = useRef(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const shot = screenshots[active];
  const select = (index: number) => {
    setActive(index);
    stageRef.current?.scrollTo({ top: 0, left: 0 });
    stageRef.current?.closest("dialog")?.scrollTo({ top: 0 });

  };
  const move = (direction: number) => select((active + direction + screenshots.length) % screenshots.length);
  return <section className={`project-viewer viewer-${project.id}`} aria-label={`${project.name} screenshot gallery`} aria-roledescription={screenshots.length > 1 ? "carousel" : undefined}
    onKeyDown={(event) => {
      if (screenshots.length > 1 && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
        event.preventDefault(); move(event.key === "ArrowLeft" ? -1 : 1);
      }
    }}>
    <div className="viewer-window">
      <div className="viewer-toolbar">
        <span className="viewer-window-dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="viewer-window-title">{project.name}<span>/</span>{shot.label}</span>

      </div>
      <div id={`viewer-stage-${project.id}`} ref={stageRef} className={`viewer-stage${screenshots.length > 1 ? " viewer-carousel" : ""}${shot.height > shot.width ? " is-portrait" : ""}${dragX ? " is-dragging" : ""}`} style={{ "--drag-x": `${dragX * .65}px` } as CSSProperties} tabIndex={0} role="region" aria-label={`${shot.label} screenshot${screenshots.length > 1 ? ", swipe or use arrow keys to rotate" : ""}`}
        onPointerDown={(event) => {
          if (screenshots.length < 2 || !event.isPrimary || event.button !== 0) return;
          gestureRef.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
          draggedRef.current = false;
        }}
        onPointerMove={(event) => {
          const gesture = gestureRef.current;
          if (!gesture || gesture.pointerId !== event.pointerId) return;
          const dx = event.clientX - gesture.x;
          if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(event.clientY - gesture.y)) {
            draggedRef.current = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            setDragX(Math.max(-140, Math.min(140, dx)));
          }
        }}
        onPointerUp={(event) => {
          const gesture = gestureRef.current;
          if (!gesture || gesture.pointerId !== event.pointerId) return;
          const dx = event.clientX - gesture.x;
          if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(event.clientY - gesture.y) * 1.2) {
            move(dx < 0 ? 1 : -1);
            event.currentTarget.focus({ preventScroll: true });
          }
          gestureRef.current = null; setDragX(0);
        }}
        onPointerCancel={() => { gestureRef.current = null; setDragX(0); }}
        onClickCapture={(event) => { if (draggedRef.current) { event.preventDefault(); event.stopPropagation(); draggedRef.current = false; } }}>
        {screenshots.length > 1 ? screenshots.map((image, index) => {
          let offset = (index - active + screenshots.length) % screenshots.length;
          if (offset > screenshots.length / 2) offset -= screenshots.length;
          return <button key={image.src} type="button" className={`viewer-carousel-card${offset === 0 ? " is-active" : ""}`} style={{ "--slide-offset": offset, zIndex: screenshots.length - Math.abs(offset), opacity: Math.abs(offset) > 1 ? 0 : offset === 0 ? 1 : .65 } as CSSProperties} tabIndex={-1} aria-hidden={offset !== 0} aria-label={image.alt} onClick={() => select(index)}>
            <Image src={image.src} alt={offset === 0 ? image.alt : ""} width={image.width} height={image.height} sizes="(max-width: 700px) 72vw, 750px" className="viewer-image" loading="eager" draggable={false} />
          </button>;
        }) : <Image key={shot.src} src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} sizes="(max-width: 700px) 92vw, 940px" className="viewer-image" loading="eager" />}
      </div>
    </div>
    <div className="viewer-footer">
      <div className="viewer-caption" aria-live="polite" aria-atomic="true"><span className="viewer-eyebrow">{screenshots.length > 1 ? "Drag to rotate · Click to explore" : "A closer look"}</span><span className="viewer-shot-title">{shot.label}</span></div>

    </div>

  </section>;
}

function JourneyExplorer() {
  const [step, setStep] = useState(0);
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const steps = [
    { name: "Guest list", text: "Import guest records and manage the invitation list in one place." },
    { name: "RSVP", text: "Track guest responses and personalize invitations with Gemini AI." },
    { name: "Check-in", text: "Use QR code check-ins to connect the invitation journey with arrival at the event." },
  ];
  return <div className="journey-explorer"><p className="detail-label">Explore the guest journey</p><div className="journey-tabs" role="tablist" aria-label="Invaro guest journey">
    {steps.map((item, index) => <button type="button" role="tab" key={item.name} ref={(element) => { tabsRef.current[index] = element; }} tabIndex={step === index ? 0 : -1} id={`journey-tab-${index}`} aria-selected={step === index} aria-controls="journey-panel" onClick={() => setStep(index)} onKeyDown={(event) => {
      let next = index;
      if (event.key === "ArrowRight") next = (index + 1) % steps.length;
      else if (event.key === "ArrowLeft") next = (index + steps.length - 1) % steps.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = steps.length - 1;
      else return;
      event.preventDefault(); setStep(next); tabsRef.current[next]?.focus();
    }}>{item.name}<Icon name={index === 2 ? "check" : "arrow-right"} /></button>)}
  </div><p id="journey-panel" role="tabpanel" aria-labelledby={`journey-tab-${step}`} className="journey-text">{steps[step].text}</p></div>;
}

function ProjectCard({ project, onOpen }: { project: Project; onOpen: (project: Project) => void }) {
  const previewRef = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  function pointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (project.id === "hassel" || project.id === "qabas") return;
    if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const shot = previewRef.current?.querySelector<HTMLElement>(".project-shot");
    if (!shot) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    shot.style.transform = `perspective(1200px) rotateX(${-y * 7}deg) rotateY(${x * 8}deg) translateY(5px) scale(1.035)`;
  }
  function resetPreview() { const shot = previewRef.current?.querySelector<HTMLElement>(".project-shot"); if (shot) shot.style.transform = ""; }
  return <article className={`project-card card-${project.id}`} onPointerEnter={(event) => { if ((project.id === "hassel" || project.id === "qabas") && event.pointerType !== "touch") setHovered(true); }} onPointerLeave={() => { setHovered(false); setFocused(false); }} onFocusCapture={(event) => { if ((project.id === "hassel" || project.id === "qabas") && event.target instanceof HTMLElement && event.target.matches(":focus-visible")) setFocused(true); }} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }}>
    <button type="button" className={`project-preview preview-${project.id}`} ref={previewRef} onClick={() => onOpen(project)} onPointerMove={pointerMove} onPointerLeave={resetPreview} aria-label={`Explore ${project.name} project details`}>
      <ProjectVisual project={project} active={hovered || focused} />
      <span className="project-open"><span>Explore project</span><Icon name="arrow-up-right" /></span>
    </button>
    <div className="project-information"><div><p className="project-label">{project.label}</p><h3><button type="button" onClick={() => onOpen(project)}>{project.name}<Icon name="arrow-up-right" /></button></h3></div>{project.live ? <a className="project-live-link" href={project.live} target="_blank" rel="noreferrer" aria-label={`Visit ${project.name} live website`}>Live site<Icon name="arrow-up-right" /></a> : <span className="project-completion">Completed</span>}</div>
    <p className="project-description">{project.description}</p>
    <div className="project-tags">{project.stack.slice(0, 3).map((item) => <span key={item}>{item}</span>)}</div>
  </article>;
}

export default function ProjectGallery() {
  const [category, setCategory] = useState<Category>("all");
  const [selected, setSelected] = useState<Project | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const visibleProjects = projects.filter((project) => category === "all" || project.category === category);
  useEffect(() => {
    if (!selected || !dialogRef.current) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!dialogRef.current.open) dialogRef.current.showModal();
    return () => { document.body.style.overflow = previousOverflow; };
  }, [selected]);
  return <>
    <div className="gallery-header"><div><p className="section-label"><span className="label-line" />Selected work</p><h2>A few things<br />I’ve brought to life.</h2></div><div className="gallery-intro"><p>Different problems. One approach:<br />make the experience clear, useful, and reliable.</p><div className="project-filters" aria-label="Filter projects">{([["all", "All work"], ["products", "Products"], ["websites", "Websites"]] as [Category, string][]).map(([value, label]) => <button key={value} type="button" aria-pressed={category === value} onClick={() => setCategory(value)}>{label}{value === "all" ? <span>4</span> : null}</button>)}</div></div></div>
    <p className="sr-only" aria-live="polite">{visibleProjects.length} {visibleProjects.length === 1 ? "project" : "projects"} shown.</p>
    <div className={`project-gallery filter-${category}`}>{visibleProjects.map((project) => <ProjectCard key={project.id} project={project} onOpen={setSelected} />)}</div>
    <dialog className="project-dialog" ref={dialogRef} aria-labelledby="project-dialog-title" onClose={() => setSelected(null)} onClick={(event) => { if (event.target === event.currentTarget) dialogRef.current?.close(); }}>
      {selected ? <div className="dialog-content">
        <div className="dialog-topbar"><span>Project overview</span><button className="icon-button" type="button" onClick={() => dialogRef.current?.close()} aria-label="Close project details"><Icon name="close" /></button></div>
        <ProjectScreenshots key={selected.id} project={selected} />
        <div className="dialog-body"><p className="project-label">{selected.label}{selected.period ? ` / ${selected.period}` : ""}</p><h2 id="project-dialog-title">{selected.name}</h2><p className="dialog-description">{selected.description}</p>
          {selected.features.length > 0 || selected.stack.length > 0 ? <div className="project-detail-grid">{selected.features.length > 0 ? <div><p className="detail-label">Inside the project</p><ul className="feature-list">{selected.features.map((feature) => <li key={feature}><Icon name="check" /><span>{feature}</span></li>)}</ul></div> : null}{selected.stack.length > 0 ? <div><p className="detail-label">Built with</p><div className="dialog-stack">{selected.stack.map((technology) => <span key={technology}>{technology}</span>)}</div></div> : null}</div> : null}
          {selected.id === "invaro" ? <JourneyExplorer /> : null}
          {selected.live ? <a className="button button-dark" href={selected.live} target="_blank" rel="noreferrer">Visit {selected.domain}<Icon name="arrow-up-right" /></a> : null}
        </div>
      </div> : null}
    </dialog>
  </>;
}
