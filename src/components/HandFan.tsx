"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

interface HandFanProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  cardWidthPx?: number;
  maxSpreadDeg?: number;
  liftPx?: number;
  spacingPx?: number;
  className?: string;
  style?: CSSProperties;
}

// Uses absolute positioning + inline transforms, not flex/margin tricks,
// so the fan looks identical regardless of the page's text direction.
export function HandFan<T>({
  items,
  renderItem,
  cardWidthPx = 76,
  maxSpreadDeg = 30,
  liftPx = 14,
  spacingPx,
  className = "",
  style,
}: HandFanProps<T>) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const n = items.length;
  const mid = (n - 1) / 2;
  const anglePerCard = n > 1 ? Math.min(9, maxSpreadDeg / (n - 1)) : 0;
  const spacing = spacingPx ?? Math.max(cardWidthPx * (n > 6 ? 0.34 : 0.46), 22);
  const containerWidth = n > 0 ? spacing * (n - 1) + cardWidthPx : cardWidthPx;

  return (
    <div
      className={`relative ${className}`}
      style={{ width: containerWidth, height: "100%", ...style }}
    >
      {items.map((item, i) => {
        const offset = i - mid;
        const rotate = offset * anglePerCard;
        const translateY = Math.abs(offset) * (n > 1 ? liftPx / mid : 0);
        const translateX = offset * spacing;
        const isHovered = hoveredIndex === i;

        return (
          <div
            key={i}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex((h) => (h === i ? null : h))}
            className="absolute bottom-0 left-1/2 origin-bottom transition-transform duration-200 ease-out"
            style={{
              transform: `translateX(calc(-50% + ${translateX}px)) translateY(${
                isHovered ? translateY - 16 : translateY
              }px) rotate(${isHovered ? 0 : rotate}deg)`,
              zIndex: isHovered ? 50 : i,
            }}
          >
            {renderItem(item, i)}
          </div>
        );
      })}
    </div>
  );
}
