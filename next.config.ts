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
    // @ts-expect-error: Turbopackでは文字列形式を使用
    rehypePlugins: [["rehype-unwrap-images"]],
  },
});

export default withMDX(nextConfig);
