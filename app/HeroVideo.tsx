"use client";

import { useEffect, useRef, useState } from "react";
import { mountVideoGaze } from "./video-gaze";

export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [gazeReady, setGazeReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current, canvas = canvasRef.current, stage = stageRef.current;
    if (!video || !canvas || !stage) return;
    return mountVideoGaze(video, canvas, stage, () => setGazeReady(true), "/videos/ahmed-hero-v2-eye-tracks.json");
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let restartTimer: ReturnType<typeof setTimeout> | null = null;
    let remainingWait = 0, waitStarted = 0;
    const clearRestart = () => {
      if (restartTimer === null) return;
      clearTimeout(restartTimer); restartTimer = null;
      remainingWait = Math.max(0, remainingWait - (performance.now() - waitStarted));
    };
    const sync = () => {
      clearRestart();
      if (media.matches || !visible || document.hidden) { video.pause(); return; }
      if (remainingWait > 0) {
        waitStarted = performance.now();
        restartTimer = setTimeout(() => {
          restartTimer = null; remainingWait = 0;
          video.currentTime = 0; sync();
        }, remainingWait);
        return;
      }
      if (video.ended) video.currentTime = 0;
      void video.play().catch(() => {});
    };
    const ended = () => { clearRestart(); remainingWait = 2000; sync(); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(stageRef.current ?? video);
    video.addEventListener("canplay", sync);
    video.addEventListener("ended", ended);
    document.addEventListener("visibilitychange", sync);
    media.addEventListener("change", sync);
    sync();
    return () => {
      clearRestart();
      observer.disconnect();
      video.removeEventListener("canplay", sync);
      video.removeEventListener("ended", ended);
      document.removeEventListener("visibilitychange", sync);
      media.removeEventListener("change", sync);
      video.pause();
    };
  }, []);

  return (
    <div className={`hero-video hero-avatar-shell ${gazeReady ? "has-live-gaze" : ""}`}>
      <div ref={stageRef} className="hero-video-stage">
        <img className="hero-video-poster" src="/videos/ahmed-hero-v2-poster.png" alt="" aria-hidden="true" />
        <video ref={videoRef} className="hero-avatar-video" src="/videos/ahmed-hero-v2-transparent.webm" poster="/videos/ahmed-hero-v2-poster.png" muted playsInline preload="auto" aria-label="Ahmed smiling and waving, repeating after a two-second pause" onError={() => setFailed(true)} />
        <canvas ref={canvasRef} className="hero-gaze-canvas" aria-hidden="true" />
        {failed && <p className="hero-video-error">The video couldn’t load. Please refresh to try again.</p>}
      </div>
      <div className="waving-avatar-caption"><span className="focus-dot" />Hey, I’m Ahmed.</div>
    </div>
  );
}
