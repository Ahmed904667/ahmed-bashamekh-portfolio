"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icons";
import type { PortraitControls } from "./portrait-scene";

export default function WavingAvatar() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlsRef = useRef<PortraitControls | null>(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const stage = stageRef.current, canvas = canvasRef.current;
    if (!stage || !canvas) return;
    import("./portrait-scene").then(({ mountPortrait }) => {
      if (cancelled) return null;
      return mountPortrait(stage, canvas, (value) => { if (!cancelled) setReduced(value); });
    }).then((controls) => {
      if (!controls) return;
      if (cancelled) { controls.dispose(); return; }
      controlsRef.current = controls;
      setReady(true);
    }).catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; controlsRef.current?.dispose(); controlsRef.current = null; };
  }, []);
  function togglePause() {
    const next = !paused;
    setPaused(next);
    controlsRef.current?.pause(next);
  }
  return (
    <div className="waving-avatar">
      <div ref={stageRef} className={`waving-avatar-stage portrait-stage ${ready ? "portrait-ready" : ""}`} role="img" aria-label="Ahmed's chest-up textured bust, with a smoothly waving 3D hand and eyes that follow your mouse">
        <div className="portrait-fallback" aria-hidden="true" />
        <canvas ref={canvasRef} className="portrait-canvas" aria-hidden="true" />
      </div>
      <div className="waving-avatar-caption"><span className="focus-dot" />Hey, I’m Ahmed.</div>
      <div className="sculpture-controls waving-avatar-controls">
        <button className="wave-again" type="button" disabled={reduced || !ready} onClick={() => { setPaused(false); controlsRef.current?.wave(); }}>Wave again<span aria-hidden="true">↗</span></button>
        <button className="icon-button" type="button" disabled={reduced || !ready} aria-pressed={paused || reduced} aria-label={reduced ? "Reduced motion enabled" : paused ? "Play waving animation" : "Pause waving animation"} onClick={togglePause}><Icon name={paused || reduced ? "play" : "pause"} /></button>
      </div>
      <span className="sr-only" role="status">{failed ? "Static portrait displayed. Interactive portrait could not load." : ready ? "Portrait ready. Move your mouse to guide Ahmed’s eyes." : "Loading interactive portrait."}</span>
    </div>
  );
}
