"use client";

import { useState } from "react";
import BreathingOrb from "./BreathingOrb";
import Ripple from "./Ripple";
import Oreo from "./Oreo";

interface RippleData {
  id: number;
  x: number;
  y: number;
}

export default function ZenCanvas() {
  const [ripples, setRipples] = useState<RippleData[]>([]);

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const ripple = {
      id: Date.now(),
      x: e.clientX,
      y: e.clientY,
    };

    setRipples((prev) => [...prev, ripple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
    }, 800);
  }

  return (
    <main
      onClick={handleClick}
      className="relative h-screen w-screen overflow-hidden bg-gradient-to-b from-[#09090f] via-[#111827] to-black"
    >
      {/* Background glow */}
      <BreathingOrb />

      {/* Oreo */}
      <Oreo />

      {/* Ripples */}
      {ripples.map((r) => (
        <Ripple key={r.id} x={r.x} y={r.y} />
      ))}

   {/* Title */}
<div className="absolute top-6 left-6 text-left z-10">
  <h1 className="text-3xl text-white">Hey Meg ✨</h1>
  <p className="mt-2 text-base text-white/70 font-sans">
    Take a deep breath.
  </p>
</div>
    </main>
  );
}