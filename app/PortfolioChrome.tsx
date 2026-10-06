"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Icon } from "./Icons";

export function Header() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const progressRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    let frame = 0;
    function updateProgress() {
      const available = document.documentElement.scrollHeight - window.innerHeight;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${available > 0 ? window.scrollY / available : 0})`;
      if (window.scrollY < 250) setActive("");
      frame = 0;
    }
    function scroll() { if (!frame) frame = requestAnimationFrame(updateProgress); }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) setActive(entry.target.id); });
    }, { rootMargin: "-20% 0px -55% 0px" });
    ["work", "about", "contact"].forEach((id) => { const element = document.getElementById(id); if (element) observer.observe(element); });
    window.addEventListener("scroll", scroll, { passive: true });
    updateProgress();
    return () => { observer.disconnect(); window.removeEventListener("scroll", scroll); cancelAnimationFrame(frame); };
  }, []);
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) { if (event.key === "Escape") { setOpen(false); menuRef.current?.focus(); } }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  return (
    <header className="site-header">
      <div className="reading-progress" ref={progressRef} aria-hidden="true" />
      <div className="header-inner container">
        <a href="#top" className="brand" aria-label="Ahmed Bashamekh home">
          <Image className="brand-avatar" src="/images/navbar-avatar.png" alt="" width={50} height={50} sizes="50px" priority />
          <span>Ahmed Bashamekh<span className="brand-role">Software engineer</span></span>
        </a>
        <nav className={`header-nav ${open ? "menu-open" : ""}`} id="main-navigation" aria-label="Main navigation">
          {[["work", "Work"], ["about", "About"], ["contact", "Contact"]].map(([id, label]) => <a key={id} href={`#${id}`} onClick={() => setOpen(false)} aria-current={active === id ? "location" : undefined}>{label}<span className="nav-dot" /></a>)}
        </nav>
        <a className="header-contact" href="mailto:as.bashamkha@gmail.com">Let’s talk <Icon name="arrow-up-right" /></a>
        <button ref={menuRef} className="mobile-menu-button icon-button" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="main-navigation" aria-label={open ? "Close navigation" : "Open navigation"}><Icon name={open ? "close" : "menu"} /></button>
      </div>
    </header>
  );
}

export function RiyadhClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Riyadh", hour: "2-digit", minute: "2-digit", hour12: false });
    function update() { setTime(formatter.format(new Date())); }
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);
  return <span className="location-time"><span className="location-dot" />Riyadh, SA<span className="local-time" aria-label="Local time in Riyadh">{time ? `${time} GMT+3` : "GMT+3"}</span></span>;
}

export function CopyEmail() {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);
  async function copy() {
    try { await navigator.clipboard.writeText("as.bashamkha@gmail.com"); setState("copied"); }
    catch { setState("error"); }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setState("idle"), 2800);
  }
  return <button className="copy-email" type="button" onClick={copy}><Icon name={state === "copied" ? "check" : "copy"} /><span aria-live="polite">{state === "copied" ? "Email copied" : state === "error" ? "Use the email link" : "Copy email address"}</span></button>;
}
