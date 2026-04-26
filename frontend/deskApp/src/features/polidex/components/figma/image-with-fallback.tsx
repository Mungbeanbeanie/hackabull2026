"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";

const ERROR_IMG_SRC =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==";

type ImageWithFallbackProps = {
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
  loading?: "eager" | "lazy";
  onLoadStateChange?: (loaded: boolean) => void;
};

export function ImageWithFallback({ src, alt, className, style, loading, onLoadStateChange }: ImageWithFallbackProps) {
  const [didError, setDidError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const resolvedSrc = didError ? ERROR_IMG_SRC : src;

  const unoptimized = resolvedSrc.startsWith("data:");

  return (
    <div className="relative h-full w-full">
      {!isLoaded && <div className="absolute inset-0 bg-[#E9EDF2]" />}
      <Image
        src={resolvedSrc}
        alt={alt}
        fill
        loading={loading}
        className={className}
        style={style}
        sizes="(max-width: 768px) 100vw, 33vw"
        unoptimized={unoptimized}
        onLoad={() => {
          setIsLoaded(true);
          onLoadStateChange?.(true);
        }}
        onError={() => {
          if (!didError) {
            setDidError(true);
          } else {
            setIsLoaded(true);
            onLoadStateChange?.(true);
          }
        }}
      />
    </div>
  );
}
