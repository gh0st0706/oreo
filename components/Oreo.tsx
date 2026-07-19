"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type AnimName = "sleep" | "wake" | "pet" | "walk" | "sit";

const FRAMES: Record<AnimName, { frames: string[]; fps: number; loop: boolean }> = {
  sleep: {
    frames: [
      "/sprites/oreo-sleep-1.png",
      "/sprites/oreo-sleep-2.png",
      "/sprites/oreo-sleep-3.png",
      "/sprites/oreo-sleep-4.png",
    ],
    fps: 2,
    loop: true,
  },
  wake: {
    frames: [
      "/sprites/oreo-wake-1.png",
      "/sprites/oreo-wake-2.png",
      "/sprites/oreo-wake-3.png",
      "/sprites/oreo-wake-4.png",
    ],
    fps: 6,
    loop: false,
  },
  pet: {
    frames: [
      "/sprites/oreo-jump-1.png",
      "/sprites/oreo-jump-2.png",
      "/sprites/oreo-jump-3.png",
      "/sprites/oreo-jump-4.png",
      "/sprites/oreo-jump-5.png",
    ],
    fps: 9,
    loop: false,
  },
  walk: {
    frames: [
      "/sprites/oreo-walk-1.png",
      "/sprites/oreo-walk-2.png",
      "/sprites/oreo-walk-3.png",
      "/sprites/oreo-walk-4.png",
    ],
    fps: 8,
    loop: true,
  },
  sit: { frames: ["/sprites/oreo-wake-4.png"], fps: 1, loop: false },
};

// --- tiny synthesized purr, no audio file needed ---
function playPurr(durationMs = 900) {
  try {
    const AudioCtx =
      window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();

    const rumble = ctx.createOscillator();
    rumble.type = "sine";
    rumble.frequency.value = 28;

    const tremolo = ctx.createOscillator();
    tremolo.type = "sine";
    tremolo.frequency.value = 24;

    const tremoloGain = ctx.createGain();
    tremoloGain.gain.value = 0.5;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.0001;

    tremolo.connect(tremoloGain);
    tremoloGain.connect(masterGain.gain);
    rumble.connect(masterGain);
    masterGain.connect(ctx.destination);

    const now = ctx.currentTime;
    masterGain.gain.exponentialRampToValueAtTime(0.16, now + 0.15);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);

    rumble.start(now);
    tremolo.start(now);
    rumble.stop(now + durationMs / 1000 + 0.05);
    tremolo.stop(now + durationMs / 1000 + 0.05);
    setTimeout(() => ctx.close(), durationMs + 200);
  } catch {
    // Web Audio blocked/unsupported — animation still works without sound
  }
}

interface OreoProps {
  size?: number;
  initialLeftPercent?: number;
  minPercent?: number; // left wander boundary
  maxPercent?: number; // right wander boundary
  followSpeed?: number; // percent moved per tick — higher = faster chase
  sleepAfterMs?: number; // how long without real movement before dozing off
}

export default function Oreo({
  size = 220,
  initialLeftPercent = 20,
  minPercent = 8,
  maxPercent = 85,
  followSpeed = 1.1,
  sleepAfterMs = 20000,
}: OreoProps) {
  const [anim, setAnim] = useState<AnimName>("sleep");
  const [frameIndex, setFrameIndex] = useState(0);
  const [facing, setFacing] = useState<1 | -1>(1);
  const [leftPercent, setLeftPercent] = useState(initialLeftPercent);

  const animRef = useRef<AnimName>(anim);
  const leftPercentRef = useRef(initialLeftPercent);
  const busyRef = useRef(false);
  const targetPercentRef = useRef(initialLeftPercent);
  const lastMovedAtRef = useRef(Date.now());

  animRef.current = anim;
  leftPercentRef.current = leftPercent;

  // --- track the cursor, clamped to the allowed wander range ---
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      const pct = (e.clientX / window.innerWidth) * 100;
      targetPercentRef.current = Math.min(maxPercent, Math.max(minPercent, pct));
    }
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [minPercent, maxPercent]);

  // --- follow loop: step toward the cursor a little bit each tick ---
  useEffect(() => {
    const DEADZONE = 2; // percent — close enough to stop and sit
    const tick = setInterval(() => {
      if (busyRef.current) return; // don't move mid wake/pet sequence

      const current = leftPercentRef.current;
      const target = targetPercentRef.current;
      const diff = target - current;

      if (Math.abs(diff) < DEADZONE) {
        if (animRef.current === "walk") setAnim("sit");
        return;
      }

      lastMovedAtRef.current = Date.now();
      if (animRef.current === "sleep") return; // asleep cats don't chase cursors

      const step = Math.sign(diff) * Math.min(followSpeed, Math.abs(diff));
      setFacing(diff > 0 ? 1 : -1);
      setLeftPercent(current + step);
      if (animRef.current !== "walk") setAnim("walk");
    }, 90);

    return () => clearInterval(tick);
  }, [followSpeed]);

  // --- doze off after a stretch with no real movement ---
  useEffect(() => {
    const check = setInterval(() => {
      if (busyRef.current) return;
      if (animRef.current === "sleep") return;
      if (Date.now() - lastMovedAtRef.current > sleepAfterMs) {
        setAnim("sleep");
      }
    }, 1000);
    return () => clearInterval(check);
  }, [sleepAfterMs]);

  const onAnimEnd = useCallback((finishedAnim: AnimName) => {
    if (finishedAnim === "wake") {
      playPurr(900);
      setAnim("pet");
    } else if (finishedAnim === "pet") {
      busyRef.current = false;
      lastMovedAtRef.current = Date.now();
      setAnim("sit");
    }
  }, []);

  // frame-stepping loop for whichever animation is active
  useEffect(() => {
    const config = FRAMES[anim];
    let frame = 0;
    setFrameIndex(0);
    const interval = setInterval(() => {
      frame += 1;
      if (frame >= config.frames.length) {
        if (config.loop) {
          frame = 0;
          setFrameIndex(0);
        } else {
          clearInterval(interval);
          onAnimEnd(anim);
        }
      } else {
        setFrameIndex(frame);
      }
    }, 1000 / config.fps);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anim]);

  const lastTapAtRef = useRef(0);
  const pendingTapRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const DOUBLE_TAP_MS = 300;

  const petNow = useCallback(() => {
    if (animRef.current === "sleep") {
      busyRef.current = true;
      setAnim("wake"); // -> triggers 'pet' + purr automatically on completion
      return;
    }
    if (busyRef.current) return; // ignore rapid clicks mid-sequence

    busyRef.current = true;
    playPurr(900);
    setAnim("pet");
  }, []);

  const forceSleep = useCallback(() => {
    busyRef.current = false;
    setAnim("sleep");
  }, []);

  const handleTap = useCallback(() => {
    const now = Date.now();
    const isDoubleTap = now - lastTapAtRef.current < DOUBLE_TAP_MS;
    lastTapAtRef.current = now;

    if (isDoubleTap) {
      clearTimeout(pendingTapRef.current);
      forceSleep();
      return;
    }

    // wait briefly to see if a second tap follows before reacting
    pendingTapRef.current = setTimeout(petNow, DOUBLE_TAP_MS);
  }, [petNow, forceSleep]);

  const config = FRAMES[anim];
  const src = config.frames[Math.min(frameIndex, config.frames.length - 1)];

  return (
    <button
      type="button"
      aria-label="Pet Oreo"
      onClick={handleTap}
      className="absolute bottom-10 z-50 cursor-pointer border-none bg-transparent p-0"
      style={{
        left: `${leftPercent}%`,
        width: size,
        transform: `translateX(-50%) scaleX(${facing})`,
      }}
    >
      <img
        src={src}
        alt="Oreo the cat"
        draggable={false}
        style={{ width: "100%", height: "auto", imageRendering: "pixelated" }}
      />
    </button>
  );
}
