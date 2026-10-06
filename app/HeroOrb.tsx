"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Icon } from "./Icons";
import HeroVideo from "./HeroVideo";
import type { SculptureControls, SculptureMode, SculptureView } from "./sculpture-scene";

export default function HeroOrb() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlsRef = useRef<SculptureControls | null>(null);
  const dragRef = useRef<{ id: number; startX: number; startY: number; x: number; y: number; active: boolean } | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [mode, setMode] = useState<SculptureMode>("surface");
  const [view, setView] = useState<SculptureView>("avatar");
  const settingsRef = useRef({ view: "avatar" as SculptureView, mode: "surface" as SculptureMode, paused: false });

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setFailed(false);
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    import("./sculpture-scene").then(({ mountSculpture }) => {
      if (cancelled) return;
      try {
        controlsRef.current = mountSculpture(stage, canvas, setReduced);
        controlsRef.current.setView(settingsRef.current.view === "avatar" ? "sculpture" : settingsRef.current.view);
        controlsRef.current.setMode(settingsRef.current.mode);
        controlsRef.current.setPaused(settingsRef.current.view === "avatar" || settingsRef.current.paused);
        setReady(true);
      } catch {
        setFailed(true);
      }
    }).catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; controlsRef.current?.dispose(); controlsRef.current = null; };
  }, []);

  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || !ready) return;
    dragRef.current = { id: event.pointerId, startX: event.clientX, startY: event.clientY, x: event.clientX, y: event.clientY, active: false };
  }
  function pointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (drag && drag.id === event.pointerId) {
      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      if (!drag.active) {
        if (Math.hypot(dx, dy) < 6) return;
        if (event.pointerType === "touch" && Math.abs(dy) > Math.abs(dx)) return;
        drag.active = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        event.currentTarget.classList.add("is-dragging");
      }
      controlsRef.current?.rotate((event.clientX - drag.x) * 0.009, (event.clientY - drag.y) * 0.007);
      drag.x = event.clientX;
      drag.y = event.clientY;
      return;
    }
    if (event.pointerType !== "touch" && !reduced) {
      const bounds = event.currentTarget.getBoundingClientRect();
      controlsRef.current?.hover((event.clientX - bounds.left) / bounds.width - 0.5, (event.clientY - bounds.top) / bounds.height - 0.5);
    }
  }
  function pointerEnd(event: PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    event.currentTarget.classList.remove("is-dragging");
    dragRef.current = null;
  }
  function keyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    const moves: Record<string, [number, number]> = { ArrowLeft: [-0.18, 0], ArrowRight: [0.18, 0], ArrowUp: [0, -0.15], ArrowDown: [0, 0.15] };
    if (moves[event.key]) {
      event.preventDefault();
      controlsRef.current?.rotate(...moves[event.key]);
    }
    if (event.key === "Home") { event.preventDefault(); controlsRef.current?.reset(); }
  }
  function selectMode(nextMode: SculptureMode) { settingsRef.current.mode = nextMode; setMode(nextMode); controlsRef.current?.setMode(nextMode); }
  function selectView(nextView: SculptureView) { if (nextView !== "avatar") controlsRef.current?.setView(nextView); controlsRef.current?.setPaused(nextView === "avatar" || paused); settingsRef.current.view = nextView; setView(nextView); }
  function togglePause() { const next = !paused; settingsRef.current.paused = next; setPaused(next); controlsRef.current?.setPaused(next); }

  return (
    <div className={`sculpture-shell ${ready ? "is-ready" : ""}`}>
      <div className="hero-view-switch scene-segment" role="group" aria-label="Choose a hero view">
        <button type="button" aria-pressed={view === "sculpture"} onClick={() => selectView("sculpture")} disabled={!ready}>Sculpture</button>
        <button type="button" aria-pressed={view === "laptop"} onClick={() => selectView("laptop")} disabled={!ready}>Laptop <span aria-hidden="true">⌘</span></button>
        <button type="button" aria-pressed={view === "avatar"} onClick={() => selectView("avatar")}>Avatar</button>
      </div>
      {view === "avatar" && <HeroVideo />}
      <div hidden={view === "avatar"}
        className="sculpture-stage" ref={stageRef} tabIndex={ready && view !== "avatar" ? 0 : -1} role="group"
        aria-label={`Interactive 3D ${view === "laptop" ? "laptop with a coding IDE" : view === "avatar" ? "avatar of Ahmed" : "sculpture"}. Drag horizontally or use arrow keys to rotate. Home resets the view.`}
        onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerEnd} onPointerCancel={pointerEnd}
        onPointerLeave={() => { if (!dragRef.current?.active) controlsRef.current?.hover(0, 0); }} onKeyDown={keyDown}
      >
        <div className="sculpture-placeholder" aria-hidden="true">
          <svg viewBox="0 0 520 500" fill="none"><defs><linearGradient id="sculpture-blue" x1="70" y1="120" x2="440" y2="400"><stop stopColor="#7899ff" /><stop offset=".45" stopColor="#294ed8" /><stop offset="1" stopColor="#10265e" /></linearGradient></defs><path d="M157 172C40 260 130 428 268 373c105-42 214-159 117-233C281 60 206 195 169 275c-47 104 85 170 165 81 75-84 62-244-48-243-121 0-128 182-24 220" stroke="url(#sculpture-blue)" strokeWidth="48" strokeLinecap="round" /></svg>
        </div>
        <canvas ref={canvasRef} className="sculpture-canvas" aria-hidden="true" />
      </div>
      <div className="sculpture-caption" hidden={view === "avatar"}>
        <span><span className="drag-glyph" aria-hidden="true">↔</span>{failed ? "A study in connected systems" : "Drag to explore"}</span>
        <span>{view === "laptop" ? "A glimpse into my workspace." : view === "avatar" ? "A little more me." : "Digital craft, in motion."}</span>
      </div>
      <div className="sculpture-controls" hidden={view === "avatar"} aria-label="3D scene controls">
        <div className="scene-segment" aria-label="Rendering mode">
          <button type="button" aria-pressed={mode === "surface"} onClick={() => selectMode("surface")} disabled={!ready}>Solid</button>
          <button type="button" aria-pressed={mode === "structure"} onClick={() => selectMode("structure")} disabled={!ready}>Wireframe</button>
        </div>
        <div className="scene-actions">
          <button type="button" className="icon-button" onClick={() => controlsRef.current?.reset()} disabled={!ready} aria-label="Reset 3D view" title="Reset view"><Icon name="reset" /></button>
          <button type="button" className="icon-button" onClick={togglePause} disabled={!ready || reduced} aria-label={reduced ? "Automatic motion disabled by your device preference" : paused ? "Play 3D animation" : "Pause 3D animation"} aria-pressed={paused || reduced} title={reduced ? "Reduced motion enabled" : paused ? "Play motion" : "Pause motion"}><Icon name={paused || reduced ? "play" : "pause"} /></button>
        </div>
      </div>
      <span className="sr-only" role="status">{view === "avatar" ? "Ahmed’s smiling and waving video." : failed ? "Static illustration displayed. The rest of the portfolio is fully available." : ready ? `3D ${view} ready. Drag or use arrow keys to rotate.` : "Loading interactive 3D scenes."}</span>
    </div>
  );
}
