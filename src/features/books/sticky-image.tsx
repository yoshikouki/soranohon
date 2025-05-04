"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface StickyImageProps {
  src?: string;
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function StickyImage({
  src: _src,
  alt = "",
  title,
  width = 800,
  height = 600,
  className,
  ...props
}: StickyImageProps) {
  const src = _src?.startsWith("/") ? _src : `/${_src}`;

  const [isSticky, setIsSticky] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const imageRef = useRef<HTMLSpanElement>(null);
  const id = src?.split("/").pop()?.split(".")[0] || "image";

  // 画像のIntersection Observerを設定
  useEffect(() => {
    if (!imageRef.current) return;

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setIsSticky(true);
        } else {
          // 画面外に出た場合は非表示に
          if (entry.boundingClientRect.top < 0) {
            setIsSticky(false);
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: [0, 0.1, 0.5, 1],
      rootMargin: "-10% 0px -80% 0px",
    });

    observer.observe(imageRef.current);

    return () => {
      if (imageRef.current) {
        observer.unobserve(imageRef.current);
      }
    };
  }, []);

  if (!src) return;

  return (
    <span
      ref={imageRef}
      id={id}
      className={cn(
        "mx-auto mt-4 mb-8 block w-full max-w-md transition-all duration-300",
        isVisible ? "opacity-100" : "opacity-0",
        isSticky ? "sticky top-16 z-20" : "",
        className,
      )}
      {...props}
    >
      <span className="relative block">
        <Image
          src={src}
          alt={alt}
          title={title}
          width={width}
          height={height}
          className="mx-auto rounded-lg object-contain shadow-lg"
          priority
        />
        <span className="absolute inset-0 block rounded-lg shadow-[inset_0_0_20px_rgba(0,0,0,0.1)]" />
      </span>
    </span>
  );
}
