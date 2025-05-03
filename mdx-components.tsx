import type { MDXComponents } from "mdx/types";
import { JapaneseTextFormatter } from "@/features/books/JapaneseTextFormatter";

/**
 * MDXコンポーネントのカスタマイズ
 * 日本語テキストの段落に自然な改行処理を適用します
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // 段落に日本語改行最適化を適用
    p: ({ children }) => (
      <p>
        <JapaneseTextFormatter>{children}</JapaneseTextFormatter>
      </p>
    ),
    // その他のコンポーネントは変更なし
    ...components,
  };
}
