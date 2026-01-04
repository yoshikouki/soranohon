import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import rehypeUnwrapImages from "rehype-unwrap-images";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  reactCompiler: true,
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [rehypeUnwrapImages],
  },
});

export default withMDX(nextConfig);
