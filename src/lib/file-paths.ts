/**
 * Central location for all filesystem paths
 * Used to avoid hardcoding file paths throughout the application
 */

export const filePaths = {
  books: {
    sources: {
      mdx: (bookId: string) => `./src/books/${bookId}.mdx`,
      illustrationPlans: (bookId: string) => `./src/books/${bookId}.plan.md`,
    },
    images: {
      keyVisual: (bookId: string) => `/images/books/${bookId}/key-visual.webp`,
      scene: (bookId: string, sceneIndex: number) =>
        `/images/books/${bookId}/scene-${sceneIndex}.webp`,
      custom: (bookId: string, filename: string) => `/images/books/${bookId}/${filename}.webp`,
    },
    publicPaths: {
      keyVisual: (bookId: string) => `./public/images/books/${bookId}/key-visual.webp`,
      scene: (bookId: string, sceneIndex: number) =>
        `./public/images/books/${bookId}/scene-${sceneIndex}.webp`,
      custom: (bookId: string, filename: string) =>
        `./public/images/books/${bookId}/${filename}.webp`,
    },
  },
};
