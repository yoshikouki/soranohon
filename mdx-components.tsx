import type { MDXComponents } from "mdx/types";
import { Paragraph } from "@/features/books/paragraph";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    p: Paragraph,
  };
}
