type Eye = { x: number; y: number; w: number; h: number; cx?: number; cy?: number; r?: number; gw?: number; a?: number; open?: number; p: [number, number][] };
type EyeTracks = { width: number; height: number; fps: number; emptySockets?: boolean; frames: Eye[][] };

/** Composite gaze into the moving video's tracked eye sockets, preserving alpha. */
export function mountVideoGaze(video: HTMLVideoElement, canvas: HTMLCanvasElement, stage: HTMLDivElement, onReady: () => void, tracksUrl = "/videos/ahmed-eye-tracks.json") {
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return () => {};
  const abort = new AbortController();
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  let tracks: EyeTracks | null = null;
  let disposed = false, visible = true, animation = 0, previousTime = 0, ready = false;
  let targetX = 0, targetY = 0, gazeX = 0, gazeY = 0;
  let targetWeight = 0, weight = 0;
  let presentedTime: number | null = null, videoFrameRequest = 0;
  const frameBuffer = document.createElement("canvas");
  const frameContext = frameBuffer.getContext("2d", { alpha: true });
  let bufferedTime: number | null = null;
  const exactVideoFrames = typeof video.requestVideoFrameCallback === "function";
  function cacheFrame(time: number) {
    if (!tracks || !frameContext || video.readyState < 2) return;
    frameContext.clearRect(0, 0, tracks.width, tracks.height);
    frameContext.drawImage(video, 0, 0, tracks.width, tracks.height);
    bufferedTime = time;
  }
  function presentedFrame(_time: number, metadata: VideoFrameCallbackMetadata) {
    if (disposed) return;
    presentedTime = metadata.mediaTime;
    cacheFrame(metadata.mediaTime);
    videoFrameRequest = video.requestVideoFrameCallback(presentedFrame);
  }
  if (exactVideoFrames) videoFrameRequest = video.requestVideoFrameCallback(presentedFrame);

  function currentFrame() {
    const time = exactVideoFrames ? bufferedTime ?? presentedTime ?? video.currentTime : video.currentTime;
    // WebM timestamps are rounded to milliseconds (e.g. .083 at 24fps).
    // Flooring such a timestamp selects the previous eye mask every few frames.
    const frame = exactVideoFrames && bufferedTime !== null ? Math.round(time * tracks!.fps) : Math.floor(time * tracks!.fps);
    return Math.max(0, Math.min(tracks!.frames.length - 1, frame));
  }

  function eyePath(eye: Eye) {
    context!.beginPath();
    eye.p.forEach(([x, y], i) => {
      // Detection contours run through pixel centers. Cover the remaining
      // antialiased half pixel at the lids so white does not rim the iris.
      const expansion = tracks?.emptySockets ? 1 : 1.035;
      const px = eye.x + (x - eye.x) * expansion + (tracks?.emptySockets ? Math.sign(x - eye.x) * .25 : 0);
      const py = eye.y + (y - eye.y) * expansion + (tracks?.emptySockets ? Math.sign(y - eye.y) * .7 : 0);
      if (i === 0) context!.moveTo(px, py); else context!.lineTo(px, py);
    });
    context!.closePath();
  }
  function drawEye(eye: Eye, angle: number) {
    const ctx = context!;
    ctx.save(); eyePath(eye); ctx.clip(); ctx.globalAlpha = tracks?.emptySockets ? 1 : weight;
    // Keep the fill inside a rounded eyeball aperture even when a dark hair
    // edge lies near the detection region during a head turn.
    if (!tracks?.emptySockets) {
      ctx.beginPath(); ctx.ellipse(eye.x, eye.y, eye.w * .49, eye.h * .49, angle, 0, Math.PI * 2); ctx.clip();
    }
    const sclera = ctx.createLinearGradient(0, eye.y - eye.h / 2, 0, eye.y + eye.h / 2);
    sclera.addColorStop(0, "#c8bfb3"); sclera.addColorStop(.28, "#f7f5ed"); sclera.addColorStop(.7, "#fffdf5"); sclera.addColorStop(1, "#e8e1d3");
    if (!tracks?.emptySockets) {
      ctx.fillStyle = sclera;
      ctx.fillRect(eye.x - eye.w, eye.y - eye.h, eye.w * 2, eye.h * 2);
    }
    const radius = eye.r ?? eye.h * .51;
    const headAngle = eye.a ?? angle;
    const dx = gazeX * (eye.gw ?? eye.w) * .14;
    const dy = gazeY * (eye.r ? radius * .46 : eye.h * .46);
    const x = (eye.cx ?? eye.x) + dx * Math.cos(headAngle) - dy * Math.sin(headAngle);
    const y = (eye.cy ?? eye.y) + dx * Math.sin(headAngle) + dy * Math.cos(headAngle);
    const iris = ctx.createRadialGradient(x - radius * .25, y - radius * .3, radius * .15, x, y, radius);
    iris.addColorStop(0, "#966e43"); iris.addColorStop(.68, "#76522f"); iris.addColorStop(.9, "#4c321e"); iris.addColorStop(1, "#2c2119");
    ctx.fillStyle = iris; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#161412"; ctx.beginPath(); ctx.ellipse(x, y, radius * .43, radius * .5, headAngle, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fffdf6"; ctx.beginPath(); ctx.ellipse(x - radius * .27, y - radius * .32, radius * .17, radius * .2, -.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ffffff80"; ctx.beginPath(); ctx.arc(x + radius * .25, y + radius * .2, radius * .065, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function render(time: number) {
    animation = 0;
    if (disposed || !tracks || !visible || document.hidden) return;
    const dt = previousTime ? Math.min((time - previousTime) / 1000, .05) : 1 / 60;
    previousTime = time;
    const damping = 1 - Math.exp(-11 * dt);
    const eyes = tracks.frames[currentFrame()];
    // Lids occlude a stationary eyeball during a blink. Resume gaze gradually
    // once both eyes reopen; never resize a pupil to fit the closing aperture.
    const openness = eyes?.length === 2 ? Math.min(...eyes.map(eye => eye.open ?? 1)) : 0;
    const gazeDamping = damping * Math.max(0, Math.min(1, (openness - .75) / .2));
    gazeX += (targetX - gazeX) * gazeDamping; gazeY += (targetY - gazeY) * gazeDamping;
    weight += (targetWeight - weight) * damping;
    if (video.readyState >= 2) {
      context!.clearRect(0, 0, tracks.width, tracks.height);
      if (exactVideoFrames && bufferedTime !== null) context!.drawImage(frameBuffer, 0, 0);
      else context!.drawImage(video, 0, 0, tracks.width, tracks.height);
      if ((tracks.emptySockets || (!media.matches && weight > .005)) && eyes?.length === 2) {
        const angle = Math.atan2(eyes[1].y - eyes[0].y, eyes[1].x - eyes[0].x);
        eyes.forEach((eye) => drawEye(eye, angle));
      }
      if (!ready) { ready = true; onReady(); }
    }
    if (!media.matches || !video.paused) animation = requestAnimationFrame(render);
  }
  function sync() {
    if (animation) cancelAnimationFrame(animation);
    animation = 0; previousTime = 0;
    if (!disposed && tracks && visible && !document.hidden) animation = requestAnimationFrame(render);
  }
  function pointer(event: PointerEvent) {
    if (media.matches || event.pointerType === "touch" || !tracks) return;
    const frame = currentFrame();
    const eyes = tracks.frames[frame];
    const bounds = stage.getBoundingClientRect();
    if (eyes?.length !== 2 || eyes.some(eye => (eye.open ?? 1) < .75)) return;
    const centerX = ((eyes[0].cx ?? eyes[0].x) + (eyes[1].cx ?? eyes[1].x)) / 2 / tracks.width;
    const centerY = ((eyes[0].cy ?? eyes[0].y) + (eyes[1].cy ?? eyes[1].y)) / 2 / tracks.height;
    targetX = Math.max(-1, Math.min(1, (event.clientX - bounds.left - bounds.width * centerX) / (bounds.width * .6)));
    const eyeY = bounds.top + bounds.height * centerY;
    const verticalRange = event.clientY < eyeY ? eyeY - bounds.top : bounds.bottom - eyeY;
    targetY = Math.max(-1, Math.min(1, (event.clientY - eyeY) / Math.max(1, verticalRange)));
    targetWeight = 1;
  }
  function center() { targetX = targetY = 0; targetWeight = tracks?.emptySockets ? 1 : 0; }
  function preference() { center(); sync(); }
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
  observer.observe(stage);
  window.addEventListener("pointermove", pointer, { passive: true });
  window.addEventListener("blur", center);
  document.documentElement.addEventListener("pointerleave", center);
  document.addEventListener("visibilitychange", sync);
  video.addEventListener("play", sync); video.addEventListener("seeked", sync); video.addEventListener("loadeddata", sync);
  media.addEventListener("change", preference);
  fetch(tracksUrl, { signal: abort.signal }).then((response) => {
    if (!response.ok) throw new Error("Eye tracks unavailable");
    return response.json() as Promise<EyeTracks>;
  }).then((data) => {
    if (disposed) return;
    tracks = data; if (data.emptySockets) targetWeight = weight = 1;
    canvas.width = frameBuffer.width = data.width;
    canvas.height = frameBuffer.height = data.height;
    cacheFrame(presentedTime ?? video.currentTime); sync();
  }).catch(() => { /* The original video remains visible if compositing is unavailable. */ });
  return () => {
    disposed = true; abort.abort(); if (animation) cancelAnimationFrame(animation);
    if (videoFrameRequest) video.cancelVideoFrameCallback(videoFrameRequest);
    observer.disconnect(); window.removeEventListener("pointermove", pointer); window.removeEventListener("blur", center);
    document.documentElement.removeEventListener("pointerleave", center); document.removeEventListener("visibilitychange", sync);
    video.removeEventListener("play", sync); video.removeEventListener("seeked", sync); video.removeEventListener("loadeddata", sync);
    media.removeEventListener("change", preference);
  };
}
