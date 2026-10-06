"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icons";
import { mountVideoGaze } from "./video-gaze";

export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const playingRef = useRef(true);
  const [paused, setPaused] = useState(true);
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
    let visible = true;
    playingRef.current = !media.matches;
    const sync = () => {
      if (playingRef.current && visible && !document.hidden) {
        void video.play().catch(() => setPaused(true));
      } else video.pause();
    };
    const preference = () => { playingRef.current = !media.matches; sync(); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(video);
    video.addEventListener("canplay", sync);
    document.addEventListener("visibilitychange", sync);
    media.addEventListener("change", preference);
    sync();
    return () => {
      observer.disconnect();
      video.removeEventListener("canplay", sync);
      document.removeEventListener("visibilitychange", sync);
      media.removeEventListener("change", preference);
      video.pause();
    };
  }, []);

  function togglePause() {
    const video = videoRef.current;
    if (!video) return;
    playingRef.current = video.paused;
    if (video.paused) void video.play().catch(() => setPaused(true));
    else video.pause();
  }
  function replay() {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    playingRef.current = true;
    void video.play().catch(() => setPaused(true));
  }

  return (
    <div className={`hero-video ${gazeReady ? "has-live-gaze" : ""}`}>
      <div ref={stageRef} className="hero-video-stage">
        <img className="hero-video-poster" src="/videos/ahmed-hero-v2-poster.png" alt="" aria-hidden="true" />
        <video ref={videoRef} className="hero-avatar-video" src="/videos/ahmed-hero-v2-transparent.webm" poster="/videos/ahmed-hero-v2-poster.png" muted loop playsInline preload="auto" aria-label="Ahmed smiling and waving" onPlay={() => setPaused(false)} onPause={() => setPaused(true)} onError={() => setFailed(true)} />
        <canvas ref={canvasRef} className="hero-gaze-canvas" aria-hidden="true" />
        {failed && <p className="hero-video-error">The video couldn’t load. Please refresh to try again.</p>}
      </div>
      <div className="waving-avatar-caption"><span className="focus-dot" />Hey, I’m Ahmed.</div>
      <div className="sculpture-controls waving-avatar-controls" aria-label="Hero video controls">
        <button className="wave-again" type="button" onClick={replay} disabled={failed}>Replay<Icon name="reset" /></button>
        <button className="icon-button" type="button" aria-pressed={paused} aria-label={paused ? "Play hero video" : "Pause hero video"} onClick={togglePause} disabled={failed}><Icon name={paused ? "play" : "pause"} /></button>
      </div>
    </div>
  );
}
