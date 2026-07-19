"use client";

interface RippleProps {
  x: number;
  y: number;
}

export default function Ripple({ x, y }: RippleProps) {
  return (
    <div
      className="ripple"
      style={{
        left: x,
        top: y,
      }}
    />
  );
}