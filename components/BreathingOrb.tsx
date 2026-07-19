"use client";

export default function BreathingOrb() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className="breathe rounded-full"
        style={{
          width: 180,
          height: 180,
          background:
            "radial-gradient(circle, rgba(52,211,153,.7), rgba(16,185,129,.15), transparent)",
          boxShadow:
            "0 0 80px rgba(52,211,153,.35), 0 0 180px rgba(16,185,129,.25)",
        }}
      />
    </div>
  );
}