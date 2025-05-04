"use client";

import Image from "next/image";
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

/**
 * 画像コンポーネント（スティッキー表示対応）
 *
 * pタグでのラップを避けるためにspanベースで構築されています。
 * スクロール時に上部に固定表示されるスティッキー機能があります。
 */
export function StickyImage({
  src: _src,
  alt = "",
  title,
  width = 800,
  height = 600,
  className,
  ...props
}: StickyImageProps) {
  // 絶対パスに変換
  const src = _src?.startsWith("/") ? _src : `/${_src}`;
  // 画像IDを生成（アンカーリンク用）
  const id = src?.split("/").pop()?.split(".")[0] || "image";

  if (!src) return null;

  return (
    <span
      id={id}
      className={cn("sticky top-16 z-20 mx-auto mt-4 mb-8 block w-full max-w-md", className)}
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
