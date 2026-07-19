"use client";

import { useState } from "react";
import BreathingOrb from "./BreathingOrb";
import Ripple from "./Ripple";
import Oreo from "./Oreo";
import { quotes } from "./quotes";

interface RippleData {
  id: number;
  x: number;
  y: number;
}

export default function ZenCanvas() {
  const [ripples, setRipples] = useState<RippleData[]>([]);
  const [quoteIndex, setQuoteIndex] = useState(0);

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const ripple = {
      id: Date.now(),
      x: e.clientX,
      y: e.clientY,
    };

    setRipples((prev) => [...prev, ripple]);
    setQuoteIndex((prev) => (prev + 1) % quotes.length);

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

      {/* Title, top-left corner */}
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 w-full px-6 text-center">
  <h1 className="text-5xl sm:text-6xl md:text-7xl text-white drop-shadow-lg">
    MEGGGGGGGGGGG
  </h1>

  <p
    key={quoteIndex}
    className="quote-fade mt-6 text-lg sm:text-xl md:text-2xl text-white/70 font-sans leading-relaxed"
  >
    {quotes[quoteIndex]}
  </p>
</div>
    </main>
  );
}
