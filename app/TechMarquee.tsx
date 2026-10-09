"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Icon } from "./Icons";

const technologies = [
  ["Next.js", "nextdotjs"], ["React", "react"], ["Laravel", "laravel"],
  ["TypeScript", "typescript"], ["Python", "python"], ["Tailwind CSS", "tailwindcss"],
  ["Docker", "docker"], ["Railway", "railway"],
  ["PostgreSQL", "postgresql"], ["Vercel", "vercel"],
];

export default function TechMarquee() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    function syncPreference() { setReduced(preference.matches); }
    syncPreference();
    preference.addEventListener("change", syncPreference);
    const observer = new IntersectionObserver(([entry]) => {
      root.dataset.visible = String(entry.isIntersecting);
    });
    observer.observe(root);
    function syncVisibility() { root!.dataset.hidden = String(document.hidden); }
    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", syncPreference);
      document.removeEventListener("visibilitychange", syncVisibility);
    };
  }, []);

  return (
    <div className="tech-marquee" ref={rootRef} data-paused={paused} aria-label="Technology stack">
      <div className="tech-window" tabIndex={0} aria-label="Technology logos. Focus or hover to pause movement.">
        <div className="tech-track">
          {[false, true].map((duplicate) => (
            <ul className="tech-list" key={String(duplicate)} aria-hidden={duplicate || undefined}>
              {technologies.map(([name, logo]) => (
                <li className="tech-logo" key={name}>
                  <Image src={`/tech/${logo}.svg`} alt="" width={27} height={27} />
                  <span>{name}</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
      <button type="button" className="icon-button tech-pause" onClick={() => setPaused(!paused)}
        disabled={reduced} aria-pressed={paused || reduced}
        aria-label={reduced ? "Logo motion disabled by your device preference" : paused ? "Play technology logo animation" : "Pause technology logo animation"}
        title={reduced ? "Reduced motion enabled" : paused ? "Play logos" : "Pause logos"}>
        <Icon name={paused || reduced ? "play" : "pause"} />
      </button>
    </div>
  );
}
