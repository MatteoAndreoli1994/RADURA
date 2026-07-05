"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type LazyLiveImageProps = {
  src: string;
  alt: string;
  aspect: string;
  className: string;
  fit?: "cover" | "contain";
  figureRef?: React.Ref<HTMLElement>;
  onFigureMouseEnter?: () => void;
  onFigureMouseLeave?: (event: React.MouseEvent<HTMLElement>) => void;
  figureStyle?: React.CSSProperties;
};

export function LazyLiveImage({
  src,
  alt,
  aspect,
  className,
  fit = "cover",
  figureRef,
  onFigureMouseEnter,
  onFigureMouseLeave,
  figureStyle,
}: LazyLiveImageProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <figure
      ref={(node) => {
        ref.current = node;
        if (typeof figureRef === "function") figureRef(node);
        else if (figureRef) figureRef.current = node;
      }}
      style={figureStyle}
      onMouseEnter={onFigureMouseEnter}
      onMouseLeave={onFigureMouseLeave}
      className={`relative overflow-hidden ${aspect} ${className}`}
    >
      <div
        className={`absolute inset-0 bg-background transition-opacity duration-[1200ms] ease-out ${
          loaded ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden
      />

      {visible ? (
        <Image
          src={src}
          alt={alt}
          fill
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`${fit === "contain" ? "object-contain" : "object-cover"} transition-opacity duration-[1200ms] ease-out ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          sizes="(max-width: 768px) 85vw, 35vw"
        />
      ) : null}
    </figure>
  );
}
