import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import rehypeUnwrapImages from "rehype-unwrap-images";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  experimental: {
    reactCompiler: true,
  },
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

const withMDX = createMDX({
  // 必要に応じて remark/rehype プラグインを追加可能
  options: {
    remarkPlugins: [],
    rehypePlugins: [rehypeUnwrapImages],
  },
});

export default withMDX(nextConfig);
