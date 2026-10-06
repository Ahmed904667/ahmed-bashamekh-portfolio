type IconName = "arrow-up-right" | "arrow-right" | "arrow-down" | "copy" | "check" | "close" | "plus" | "reset" | "pause" | "play" | "menu" | "download" | "code";

export function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, React.ReactNode> = {
    "arrow-up-right": <path d="M6 18 18 6M6 6h12v12" />,
    "arrow-right": <path d="M4 12h16m-7-7 7 7-7 7" />,
    "arrow-down": <path d="M12 4v16m-7-7 7 7 7-7" />,
    copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V4H4v12h4" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    plus: <path d="M12 5v14M5 12h14" />,
    reset: <><path d="M4 10a8 8 0 1 1 1 8M4 4v6h6" /></>,
    pause: <><path d="M8 5v14M16 5v14" /></>,
    play: <path d="m8 5 11 7-11 7Z" />,
    menu: <path d="M4 8h16M4 16h16" />,
    download: <path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4" />,
    code: <path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-12-2 14" />,
  };
  return <svg className={`icon ${className}`} aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}
