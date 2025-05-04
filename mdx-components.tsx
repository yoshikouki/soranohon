import type { MDXComponents } from "mdx/types";
import { Paragraph } from "@/features/books/paragraph";
import { StickyImage } from "@/features/books/sticky-image";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    p: Paragraph,
    img: StickyImage,
  };
}
