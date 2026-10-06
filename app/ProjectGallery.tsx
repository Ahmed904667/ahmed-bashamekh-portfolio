"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent } from "react";
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
    description: "A property-management SaaS for Saudi Arabia, built around a Next.js interface and PostgreSQL-backed data.",
    stack: ["Next.js", "React", "TypeScript", "Prisma", "PostgreSQL", "Vercel"],
    features: [],
    live: "https://hassel.website/", domain: "hassel.website",
  },
  {
    id: "invaro", name: "Invaro", label: "Event management platform", category: "products", period: "Final-year project / 2025",
    description: "From the first invitation to the final check-in. Guest imports, RSVP tracking, and QR-powered event arrival.",
    stack: ["Laravel", "PHP", "SQLite", "Tailwind CSS", "Gemini AI", "Twilio"],
    features: ["Guest imports and RSVP tracking", "QR code check-ins for event arrival", "Gemini invitation personalization and Twilio WhatsApp automation"],
  },
  {
    id: "qabas", name: "Qabas", label: "Bilingual agency website", category: "websites",
    description: "An Arabic and English web presence for a Riyadh marketing agency. A clear journey through its brand, services, and contact information.",
    stack: [], features: ["Arabic and English navigation", "Brand values and service discovery", "A direct path to contact the agency"],
    live: "https://qabassa.com/", domain: "qabassa.com",
  },
  {
    id: "sanad", name: "Sanad", label: "Completed software project", category: "products",
    description: "A completed software project, included in my selected body of work.",
    stack: [], features: [],
  },
];

function ProjectVisual({ project, inDialog = false }: { project: Project; inDialog?: boolean }) {
  if (project.id === "hassel" || project.id === "qabas") {
    return <>
      <div className="visual-brand">
        {project.id === "hassel" ? <span className="hassel-wordmark">Hassel<span lang="ar">حصّل</span></span> : <Image src="/projects/qabas-logo.png" alt="Qabas Marketing" width={650} height={322} className="qabas-wordmark" />}
        <span className="live-badge"><i />Live website</span>
      </div>
      <div className="project-shot">
        <div className="browser-chrome"><span className="browser-dots"><i /><i /><i /></span><span>{project.domain}</span><Icon name="arrow-up-right" /></div>
        <Image src={`/projects/${project.id === "hassel" ? "hassel" : "qabas"}-live.jpg`} alt={`Actual public ${project.name} website, shown in Arabic`} width={project.id === "hassel" ? 1619 : 1274} height={project.id === "hassel" ? 927 : 717} sizes={inDialog ? "(max-width: 800px) 95vw, 900px" : "(max-width: 700px) 90vw, 55vw"} className="project-screenshot" />
      </div>
      <span className="visual-caption">Captured from the live website</span>
    </>;
  }
  if (project.id === "invaro") {
    return <>
      <div className="visual-brand"><span className="invaro-mark">invaro<span className="invaro-mark-dot" /></span><span className="visual-category">A better arrival.</span></div>
      <div className="invitation-composition" aria-hidden="true">
        <div className="invitation-back" />
        <div className="invitation-card"><span>Invitation</span><p>Make every<br />arrival count.</p><div className="invitation-rule" /><div className="invitation-bottom"><span>Invite.<br />Connect.<br />Celebrate.</span><svg viewBox="0 0 60 60" fill="none"><path d="M4 4h18v18H4ZM38 4h18v18H38ZM4 38h18v18H4Z" stroke="currentColor" strokeWidth="4" /><path d="M31 4v11m0 11v12h13v18m-13-7v7m20-25h5v12M7 29h15m-15 3v-6m49 25h-5M29 22h6" stroke="currentColor" strokeWidth="5" /></svg></div></div>
        <span className="rsvp-chip"><Icon name="check" />RSVP confirmed</span>
      </div>
      <span className="visual-caption">Guest journey illustration</span>
    </>;
  }
  return <>
    <div className="visual-brand"><span className="sanad-label">Sanad</span><span className="visual-category">Completed project</span></div>
    <div className="sanad-composition" aria-hidden="true"><div className="sanad-layer layer-back" /><div className="sanad-layer layer-middle" /><div className="sanad-layer layer-front"><span>S</span></div><span className="sanad-outline">Sanad</span></div>
    <span className="visual-caption">Software by Ahmed Bashamekh</span>
  </>;
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
  function pointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const shot = previewRef.current?.querySelector<HTMLElement>(".project-shot");
    if (!shot) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    shot.style.transform = `perspective(1200px) rotateX(${-y * 7}deg) rotateY(${x * 8}deg) translateY(5px) scale(1.035)`;
  }
  function resetPreview() { const shot = previewRef.current?.querySelector<HTMLElement>(".project-shot"); if (shot) shot.style.transform = ""; }
  return <article className={`project-card card-${project.id}`}>
    <button type="button" className={`project-preview preview-${project.id}`} ref={previewRef} onClick={() => onOpen(project)} onPointerMove={pointerMove} onPointerLeave={resetPreview} aria-label={`Explore ${project.name} project details`}>
      <ProjectVisual project={project} />
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
        <div className={`modal-visual preview-${selected.id}`}><ProjectVisual project={selected} inDialog /></div>
        <div className="dialog-body"><p className="project-label">{selected.label}{selected.period ? ` / ${selected.period}` : ""}</p><h2 id="project-dialog-title">{selected.name}</h2><p className="dialog-description">{selected.description}</p>
          {selected.features.length > 0 || selected.stack.length > 0 ? <div className="project-detail-grid">{selected.features.length > 0 ? <div><p className="detail-label">Inside the project</p><ul className="feature-list">{selected.features.map((feature) => <li key={feature}><Icon name="check" /><span>{feature}</span></li>)}</ul></div> : null}{selected.stack.length > 0 ? <div><p className="detail-label">Built with</p><div className="dialog-stack">{selected.stack.map((technology) => <span key={technology}>{technology}</span>)}</div></div> : null}</div> : null}
          {selected.id === "invaro" ? <JourneyExplorer /> : null}
          {selected.live ? <a className="button button-dark" href={selected.live} target="_blank" rel="noreferrer">Visit {selected.domain}<Icon name="arrow-up-right" /></a> : null}
        </div>
      </div> : null}
    </dialog>
  </>;
}
