"use client";

interface ParticleProps {
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
}

export default function Particle({
  x,
  y,
  dx,
  dy,
  size,
}: ParticleProps) {
  return (
    <div
      className="absolute rounded-full bg-cyan-300 pointer-events-none"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        transform: `translate(${dx}px, ${dy}px)`,
        opacity: 0,
        transition: "transform 1.2s ease-out, opacity 1.2s ease-out",
      }}
    />
  );
}