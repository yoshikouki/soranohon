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
  width = 1024,
  height = 1024,
  className,
  ...props
}: StickyImageProps) {
  const src = _src?.startsWith("/") ? _src : `/${_src}`;
  const id = src?.split("/").pop()?.split(".")[0] || "image";

  if (!src) return null;

  return (
    <div
      id={id}
      className={cn("prose-invert sticky top-0 z-10 w-full max-w-3xl p-4", className)}
      data-illustration
    >
      <Image
        src={src}
        alt={alt}
        title={title}
        width={width}
        height={height}
        className="not-prose rounded-lg object-contain outline-16 outline-background/60"
        priority
        {...props}
      />
    </div>
  );
}
