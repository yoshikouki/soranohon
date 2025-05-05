import { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { shouldIndentParagraph } from "./utils/paragraph-utils";

interface ParagraphProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

/**
 * 段落コンポーネント
 * 全角スペースのインデントを CSS で制御する
 * 「」や（）から始まる段落はインデントしない
 * 子ども向けに読みやすいスタイリングを適用
 */
export function Paragraph({ children, className, ...props }: ParagraphProps) {
  const text = children?.toString() || "";

  return (
    <p className={cn("px-4", shouldIndentParagraph(text) && "indent-6", className)} {...props}>
      {children}
    </p>
  );
}
