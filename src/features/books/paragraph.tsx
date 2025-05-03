import { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ParagraphProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

/**
 * 段落コンポーネント
 * 全角スペースのインデントを CSS で制御する
 * 「」や（）から始まる段落はインデントしない
 */
export function Paragraph({ children, className, ...props }: ParagraphProps) {
  // 文字列に変換して最初の文字をチェック
  const text = children?.toString() || "";
  const firstChar = text.trim().charAt(0);

  // 「」や（）から始まる場合はインデントしない
  const shouldIndent = !["「", "（", "("].includes(firstChar);

  return (
    <p className={cn(shouldIndent && "indent-4", className)} {...props}>
      {children}
    </p>
  );
}
