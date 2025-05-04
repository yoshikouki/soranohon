import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  /* config options here */
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

const withMDX = createMDX({
  // 必要に応じて remark/rehype プラグインを追加可能
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

export default withMDX(nextConfig);
