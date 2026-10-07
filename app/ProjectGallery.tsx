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
      <div className="visual-brand"><span className="hassel-wordmark">Hassel<span lang="ar">حصّل</span></span><span className="live-badge"><i />Live product</span></div>
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
        <span className="qabas-language-note" lang="ar">عربي <span>/</span> English</span>
      </>}
      <span className="visual-caption">A bilingual brand experience</span>
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
    <div className="visual-brand"><span className="sanad-label">Sanad</span><span className="visual-category">Completed project</span></div>
    <div className="sanad-composition" aria-hidden="true"><div className="sanad-layer layer-back" /><div className="sanad-layer layer-middle" /><div className="sanad-layer layer-front"><span>S</span></div><span className="sanad-outline">Sanad</span></div>
    <span className="visual-caption">Software by Ahmed Bashamekh</span>
  </>;
}

const hasselScreenshots = [
  { src: "/projects/hassel-website.jpg", alt: "Hassel public website landing page", label: "Public website", width: 1440, height: 900 },
  { src: "/projects/hassel-dashboard.jpg", alt: "Hassel property portfolio dashboard", label: "Portfolio dashboard", width: 1440, height: 900 },
  { src: "/projects/hassel-assistant.jpg", alt: "Mohassel real estate assistant chat", label: "AI assistant", width: 924, height: 1186 },
  { src: "/projects/hassel-invoices.jpg", alt: "Hassel financial invoices registry", label: "Financial invoices", width: 1440, height: 899 },
  { src: "/projects/hassel-maintenance.jpg", alt: "Hassel maintenance work orders board", label: "Maintenance tracking", width: 1439, height: 900 },
];

function HasselScreenshots() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const shot = hasselScreenshots[active];
  const move = (direction: number) => setActive((index) => (index + direction + hasselScreenshots.length) % hasselScreenshots.length);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const preference = () => setReduced(media.matches);
    const visibility = () => setPageVisible(!document.hidden);
    preference(); visibility();
    media.addEventListener("change", preference);
    document.addEventListener("visibilitychange", visibility);
    return () => { media.removeEventListener("change", preference); document.removeEventListener("visibilitychange", visibility); };
  }, []);
  const rotating = !paused && !hovered && !focused && !reduced && pageVisible;
  useEffect(() => {
    if (!rotating) return;
    const timer = window.setInterval(() => setActive((index) => (index + 1) % hasselScreenshots.length), 4500);
    return () => window.clearInterval(timer);
  }, [rotating, active]);
  return <section className="hassel-screenshots" aria-label="Hassel product gallery" aria-roledescription="carousel"
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }}
    onKeyDown={(event) => { if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); move(event.key === "ArrowLeft" ? -1 : 1); } }}>
    <div className="hassel-gallery-heading"><span>Inside Hassel</span><button type="button" className="hassel-gallery-play" aria-label={paused ? "Resume gallery autoplay" : "Pause gallery autoplay"} aria-pressed={paused} onClick={() => setPaused((value) => !value)} disabled={reduced}><Icon name={paused || reduced ? "play" : "pause"} /><span>{paused || reduced ? "Paused" : "Auto play"}</span></button></div>
    <div className="hassel-screenshot-frame">
      {hasselScreenshots.map((image, index) => <div key={image.src} className="hassel-gallery-slide" hidden={active !== index} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${hasselScreenshots.length}`}>
        <Image src={image.src} alt={image.alt} fill sizes="(max-width: 800px) 95vw, 880px" loading="eager" />
      </div>)}
      <button type="button" className="hassel-screenshot-arrow previous" onClick={() => move(-1)} aria-label="Previous Hassel screenshot"><Icon name="arrow-right" /></button>
      <button type="button" className="hassel-screenshot-arrow next" onClick={() => move(1)} aria-label="Next Hassel screenshot"><Icon name="arrow-right" /></button>
    </div>
    <div className="hassel-gallery-caption" aria-live={rotating ? "off" : "polite"}><span>{shot.label}</span><span>{String(active + 1).padStart(2, "0")} <i>/</i> {String(hasselScreenshots.length).padStart(2, "0")}</span></div>
    <div className="hassel-gallery-thumbnails" aria-label="Choose a screenshot">{hasselScreenshots.map((image, index) => <button key={image.src} type="button" aria-label={`Show ${image.label}`} aria-pressed={active === index} onClick={() => setActive(index)}>
      <span className="hassel-thumbnail-image"><Image src={image.src} alt="" fill sizes="150px" /></span><span>{image.label}</span>
    </button>)}</div>
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
        {selected.id === "hassel" ? <HasselScreenshots /> : <div className={`modal-visual preview-${selected.id}`}><ProjectVisual project={selected} inDialog /></div>}
        <div className="dialog-body"><p className="project-label">{selected.label}{selected.period ? ` / ${selected.period}` : ""}</p><h2 id="project-dialog-title">{selected.name}</h2><p className="dialog-description">{selected.description}</p>
          {selected.features.length > 0 || selected.stack.length > 0 ? <div className="project-detail-grid">{selected.features.length > 0 ? <div><p className="detail-label">Inside the project</p><ul className="feature-list">{selected.features.map((feature) => <li key={feature}><Icon name="check" /><span>{feature}</span></li>)}</ul></div> : null}{selected.stack.length > 0 ? <div><p className="detail-label">Built with</p><div className="dialog-stack">{selected.stack.map((technology) => <span key={technology}>{technology}</span>)}</div></div> : null}</div> : null}
          {selected.id === "invaro" ? <JourneyExplorer /> : null}
          {selected.live ? <a className="button button-dark" href={selected.live} target="_blank" rel="noreferrer">Visit {selected.domain}<Icon name="arrow-up-right" /></a> : null}
        </div>
      </div> : null}
    </dialog>
  </>;
}
