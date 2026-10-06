"use client";

import { useId, useState, type ReactNode } from "react";
import { Icon } from "./Icons";

export default function ExperienceItem({ summary, children, defaultOpen = false }: {
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();

  return (
    <div className="experience-item" data-open={open}>
      <button className="experience-trigger" type="button" id={`${id}-trigger`} aria-expanded={open} aria-controls={`${id}-panel`} onClick={() => setOpen((value) => !value)}>
        {summary}<Icon name="plus" />
      </button>
      <div className="experience-collapse" id={`${id}-panel`} role="region" aria-labelledby={`${id}-trigger`} inert={!open}>
        <div className="experience-clip"><div className="experience-detail">{children}</div></div>
      </div>
    </div>
  );
}
