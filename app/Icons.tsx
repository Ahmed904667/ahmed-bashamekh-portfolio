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

export function BrandIcon({ name }: { name: "github" | "linkedin" }) {
  return (
    <svg className="brand-icon" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
      {name === "github" ? (
        <path d="M12 .297a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.24c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.83 1.23 1.83 1.23 1.07 1.83 2.8 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.23-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.62-2.81 5.64-5.49 5.94.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.57A12 12 0 0 0 12 .297z" />
      ) : (
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.226.792 24 1.771 24h20.451C23.2 24 24 23.226 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      )}
    </svg>
  );
}
